'use strict';

// Intake handler for the No-Math Meal Blueprint form (form name: meal-blueprint).
//
// Why this is its own function and not part of submission-created.js:
// the quiz handler parses five quiz answers and would send the wrong content.
// This handler is called directly by the form (action="/.netlify/functions/blueprint-intake"),
// so the existing quiz-results pipeline is untouched.
//
// Flow:
//   1. Validate method, form name, honeypot, name, email.
//   2. Skip exact duplicates (same email + same consent value) seen in the last 24 hours.
//   3. Record the submission through Netlify Forms (server side POST to "/").
//   4. Add the person to the MailerLite blueprint group ONLY when consent === "yes".
//   5. Transient failures (network, 429, 5xx) are queued and retried by blueprint-retry.mjs.
//   6. Always send the visitor to the thank-you page so they get the free resource.
//
// Privacy: logs contain only a short hash, never a full email address or a name.
//
// Environment variable names (values are never committed):
//   MAILERLITE_API_KEY               existing MailerLite API credential
//   MAILERLITE_BLUEPRINT_GROUP_ID    group for opted-in blueprint subscribers (must be created and approved first)
//   URL                              provided by Netlify at runtime (site origin)

const crypto = require('crypto');

const FORM_NAME = 'meal-blueprint';
const CONSENT_VERSION = 'blueprint-v1';
const THANKS_PATH = '/blueprint/thanks/';
const ERROR_PATH = '/blueprint/?error=invalid#form';
const MAX_BODY_BYTES = 8 * 1024;
const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const MAILERLITE_URL = 'https://connect.mailerlite.com/api/subscribers';
const REQUEST_TIMEOUT_MS = 8000;

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// ---------- pure helpers ----------

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function parseBody(event) {
  let raw = event.body || '';
  if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return null;
  const out = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    if (!(k in out)) out[k] = v; // first value wins
  }
  return out;
}

function validate(fields) {
  const firstName = clean(fields.first_name, 80);
  const email = clean(fields.email, 254).toLowerCase();
  if (!firstName) return { ok: false, reason: 'missing_name' };
  if (!email) return { ok: false, reason: 'missing_email' };
  if (!EMAIL_RE.test(email)) return { ok: false, reason: 'invalid_email' };
  const tld = email.split('@')[1].split('.').pop();
  if (!/^[a-z]{2,}$/.test(tld)) return { ok: false, reason: 'invalid_email' };
  return { ok: true, firstName, email };
}

function utmValue(v) {
  return clean(v, 100).replace(/[^A-Za-z0-9_.\- ]/g, '');
}

function jobId(email, consent) {
  return crypto.createHash('sha256').update(`${FORM_NAME}:${email}:${consent ? 'yes' : 'no'}`).digest('hex');
}

function redirect(location) {
  return { statusCode: 303, headers: { Location: location, 'Cache-Control': 'no-store' }, body: '' };
}

function reply(statusCode, message) {
  return { statusCode, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, body: message };
}

// ---------- dependencies (injectable for tests) ----------

function netlifyBlobsStore() {
  let store;
  try {
    const { getStore } = require('@netlify/blobs');
    store = getStore('blueprint-intake');
  } catch (e) {
    return null;
  }
  return {
    async get(key) { return store.get(key, { type: 'json' }); },
    async set(key, value) { await store.setJSON(key, value); },
    async del(key) { await store.delete(key); },
    async list(prefix) {
      const res = await store.list({ prefix });
      return (res.blobs || []).map((b) => b.key);
    },
  };
}

function defaultDeps() {
  return {
    env: process.env,
    fetch: (...args) => fetch(...args),
    store: netlifyBlobsStore(),
    now: () => Date.now(),
    log: (line) => console.log(line),
  };
}

function logEvent(deps, event, data) {
  // Never pass email, name or any free text here. Hash prefix and enums only.
  deps.log(JSON.stringify(Object.assign({ fn: 'blueprint-intake', event }, data)));
}

async function timedFetch(deps, url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await deps.fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// ---------- external steps ----------

async function recordWithNetlifyForms(job, deps, origin) {
  const body = new URLSearchParams({
    'form-name': FORM_NAME,
    first_name: job.firstName,
    email: job.email,
    marketing_consent: job.consent ? 'yes' : 'no',
    consent_version: CONSENT_VERSION,
    utm_source: job.utm.source,
    utm_medium: job.utm.medium,
    utm_campaign: job.utm.campaign,
  });
  try {
    const res = await timedFetch(deps, `${origin}/`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    // Netlify answers a form post with 200 or a 3xx redirect when it was accepted.
    return res.status >= 200 && res.status < 400 ? 'done' : 'transient';
  } catch (e) {
    return 'transient';
  }
}

async function addToMailerLite(job, deps) {
  if (!job.consent) return 'skipped_no_consent';
  const apiKey = deps.env.MAILERLITE_API_KEY;
  const groupId = deps.env.MAILERLITE_BLUEPRINT_GROUP_ID;
  if (!apiKey || !groupId) return 'skipped_not_configured';
  try {
    const res = await timedFetch(deps, MAILERLITE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: job.email,
        fields: { name: job.firstName },
        groups: [groupId],
        status: 'active',
      }),
    });
    if (res.status === 200 || res.status === 201) return 'done'; // POST /subscribers is an upsert, so repeats are safe
    if (res.status === 429 || res.status >= 500) return 'transient';
    return 'failed_permanent';
  } catch (e) {
    return 'transient';
  }
}

const TERMINAL_ML = new Set(['done', 'skipped_no_consent', 'skipped_not_configured', 'failed_permanent']);

function isComplete(job) {
  return job.steps.netlify === 'done' && TERMINAL_ML.has(job.steps.mailerlite);
}

async function processJob(job, deps, origin) {
  if (job.steps.netlify !== 'done') {
    job.steps.netlify = await recordWithNetlifyForms(job, deps, origin);
  }
  if (!TERMINAL_ML.has(job.steps.mailerlite)) {
    job.steps.mailerlite = await addToMailerLite(job, deps);
  }
  job.attempts += 1;
  return job;
}

function originFor(event, deps) {
  if (deps.env.URL) return deps.env.URL.replace(/\/$/, '');
  const host = event.headers && (event.headers['x-forwarded-host'] || event.headers.host);
  return host ? `https://${host}` : '';
}

async function safeStore(deps, fn) {
  if (!deps.store) return { unavailable: true };
  try {
    return { value: await fn(deps.store) };
  } catch (e) {
    return { unavailable: true };
  }
}

// ---------- HTTP handler ----------

function createHandler(overrides) {
  return async function handler(event) {
    const deps = Object.assign(defaultDeps(), overrides || {});

    if (event.httpMethod !== 'POST') return reply(405, 'method not allowed');

    const fields = parseBody(event);
    if (!fields) return reply(413, 'payload too large');

    if (fields['form-name'] !== FORM_NAME) {
      logEvent(deps, 'rejected', { reason: 'unexpected_form' });
      return reply(400, 'unexpected form');
    }

    // Honeypot: look successful to bots, process nothing.
    if (clean(fields['bot-field'], 200)) {
      logEvent(deps, 'dropped', { reason: 'honeypot' });
      return redirect(THANKS_PATH);
    }

    const v = validate(fields);
    if (!v.ok) {
      logEvent(deps, 'rejected', { reason: v.reason });
      return redirect(ERROR_PATH);
    }

    const consent = fields.marketing_consent === 'yes'; // only the exact value counts
    const id = jobId(v.email, consent);
    const shortId = id.slice(0, 8);
    const now = deps.now();

    const seen = await safeStore(deps, (s) => s.get(`seen/${id}`));
    if (seen.value && now - seen.value.ts < DEDUPE_TTL_MS) {
      logEvent(deps, 'duplicate', { id: shortId, consent });
      return redirect(THANKS_PATH);
    }

    const job = {
      v: 1,
      id,
      firstName: v.firstName,
      email: v.email,
      consent,
      utm: {
        source: utmValue(fields.utm_source),
        medium: utmValue(fields.utm_medium),
        campaign: utmValue(fields.utm_campaign),
      },
      steps: { netlify: 'pending', mailerlite: 'pending' },
      attempts: 0,
      createdAt: now,
    };

    const origin = originFor(event, deps);
    if (!origin) {
      job.steps.netlify = 'transient';
    } else {
      await processJob(job, deps, origin);
    }

    await safeStore(deps, (s) => s.set(`seen/${id}`, { ts: now }));

    if (!isComplete(job)) {
      const queued = await safeStore(deps, (s) => s.set(`pending/${id}`, job));
      logEvent(deps, queued.unavailable ? 'retry_unavailable' : 'queued', { id: shortId, consent, steps: job.steps });
    } else {
      logEvent(deps, 'processed', { id: shortId, consent, steps: job.steps });
    }

    // Outcome record has no email and no name.
    await safeStore(deps, (s) => s.set(`outcome/${id}`, { ts: now, consent, steps: job.steps, attempts: job.attempts }));

    return redirect(THANKS_PATH);
  };
}

// ---------- retry (called by blueprint-retry.mjs on a schedule) ----------

async function runRetry(overrides) {
  const deps = Object.assign(defaultDeps(), overrides || {});
  const summary = { examined: 0, completed: 0, requeued: 0, exhausted: 0, storeUnavailable: false };
  const listed = await safeStore(deps, (s) => s.list('pending/'));
  if (listed.unavailable) {
    summary.storeUnavailable = true;
    return summary;
  }
  const origin = deps.env.URL ? deps.env.URL.replace(/\/$/, '') : '';
  for (const key of listed.value) {
    summary.examined += 1;
    const got = await safeStore(deps, (s) => s.get(key));
    const job = got.value;
    if (!job) continue;
    const shortId = job.id.slice(0, 8);

    if (job.attempts >= MAX_ATTEMPTS) {
      // Drop the stored email once we give up, keep a PII-free record, and emit an error line for alerting.
      await safeStore(deps, (s) => s.set(`failed/${job.id}`, { ts: deps.now(), consent: job.consent, steps: job.steps, attempts: job.attempts }));
      await safeStore(deps, (s) => s.del(key));
      logEvent(deps, 'retry_exhausted', { id: shortId, steps: job.steps, level: 'error' });
      summary.exhausted += 1;
      continue;
    }

    if (!origin) {
      summary.requeued += 1;
      continue;
    }
    await processJob(job, deps, origin);
    if (isComplete(job)) {
      await safeStore(deps, (s) => s.del(key));
      await safeStore(deps, (s) => s.set(`outcome/${job.id}`, { ts: deps.now(), consent: job.consent, steps: job.steps, attempts: job.attempts }));
      logEvent(deps, 'retry_completed', { id: shortId, steps: job.steps });
      summary.completed += 1;
    } else {
      await safeStore(deps, (s) => s.set(key, job));
      logEvent(deps, 'retry_requeued', { id: shortId, steps: job.steps, attempts: job.attempts });
      summary.requeued += 1;
    }
  }
  return summary;
}

exports.handler = createHandler();
exports.createHandler = createHandler;
exports.runRetry = runRetry;
exports.defaultDeps = defaultDeps;
exports._internals = { validate, parseBody, jobId, FORM_NAME, MAX_ATTEMPTS, DEDUPE_TTL_MS, THANKS_PATH, ERROR_PATH };
