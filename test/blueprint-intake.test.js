'use strict';
// Mocked tests for netlify/functions/blueprint-intake.js. No network, no live MailerLite, no Stripe.
// Run: npm test

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, runRetry, _internals } = require('../netlify/functions/blueprint-intake.js');

const ORIGIN = 'https://staging.example.test';
const KEY = 'test-key-not-real';
const GROUP = 'test-group-not-real';
const EMAIL = 'synthetic.tester@example.test';

function memoryStore() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? JSON.parse(JSON.stringify(m.get(k))) : null; },
    async set(k, v) { m.set(k, JSON.parse(JSON.stringify(v))); },
    async del(k) { m.delete(k); },
    async list(prefix) { return [...m.keys()].filter((k) => k.startsWith(prefix)); },
  };
}

// responses: { forms: [status|'throw'...], ml: [status|'throw'...] }, last value repeats
function harness({ env, forms = [200], ml = [201], store } = {}) {
  const calls = { forms: [], ml: [] };
  const logs = [];
  const seq = (arr) => { let i = 0; return () => arr[Math.min(i++, arr.length - 1)]; };
  const nextForms = seq(forms);
  const nextMl = seq(ml);
  const fetchMock = async (url, opts) => {
    const isMl = String(url).startsWith('https://connect.mailerlite.com');
    const next = isMl ? nextMl() : nextForms();
    (isMl ? calls.ml : calls.forms).push({ url: String(url), opts });
    if (next === 'throw') throw new Error('network down');
    return { status: next };
  };
  const st = store === undefined ? memoryStore() : store;
  const deps = {
    env: env === undefined ? { MAILERLITE_API_KEY: KEY, MAILERLITE_BLUEPRINT_GROUP_ID: GROUP, URL: ORIGIN } : env,
    fetch: fetchMock,
    store: st,
    now: () => 1_800_000_000_000,
    log: (l) => logs.push(l),
  };
  return { deps, calls, logs, store: st, handler: createHandler(deps) };
}

function post(fields, overrides = {}) {
  const body = new URLSearchParams(Object.assign({ 'form-name': 'meal-blueprint', first_name: 'Sam', email: EMAIL }, fields)).toString();
  return Object.assign({ httpMethod: 'POST', headers: {}, body }, overrides);
}

const THANKS = '/blueprint/thanks/';

test('valid submission without consent: recorded once, consent=no, NOT sent to MailerLite', async () => {
  const h = harness();
  const res = await h.handler(post({}));
  assert.equal(res.statusCode, 303);
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length, 1);
  assert.equal(h.calls.ml.length, 0);
  const sent = new URLSearchParams(h.calls.forms[0].opts.body);
  assert.equal(sent.get('marketing_consent'), 'no');
  assert.equal(sent.get('form-name'), 'meal-blueprint');
  assert.equal(h.calls.forms[0].url, `${ORIGIN}/`);
});

test('marketing consent accepted: recorded as yes and added to the configured group', async () => {
  const h = harness();
  const res = await h.handler(post({ marketing_consent: 'yes' }));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length, 1);
  assert.equal(new URLSearchParams(h.calls.forms[0].opts.body).get('marketing_consent'), 'yes');
  assert.equal(h.calls.ml.length, 1);
  const body = JSON.parse(h.calls.ml[0].opts.body);
  assert.deepEqual(body.groups, [GROUP]);
  assert.equal(body.email, EMAIL);
  assert.equal(body.status, 'active');
  assert.equal(h.calls.ml[0].opts.headers.Authorization, `Bearer ${KEY}`);
});

test('consent values other than the exact string "yes" do not count', async () => {
  for (const val of ['on', 'true', 'YES', ' yes', '1', '']) {
    const h = harness();
    await h.handler(post({ marketing_consent: val, email: `a${Math.random().toString(36).slice(2)}@example.test` }));
    assert.equal(h.calls.ml.length, 0, `value "${val}" must not subscribe`);
    assert.equal(new URLSearchParams(h.calls.forms[0].opts.body).get('marketing_consent'), 'no');
  }
});

test('invalid email addresses are rejected and nothing is recorded or sent', async () => {
  const bad = ['plain', 'a@b', 'a@b.c', '@example.test', 'a b@example.test', 'a@@example.test', 'a@example..test', 'a@-example.test', 'x'.repeat(65) + '@example.test', 'a@example.t1'];
  for (const email of bad) {
    const h = harness();
    const res = await h.handler(post({ email, marketing_consent: 'yes' }));
    assert.equal(res.statusCode, 303, email);
    assert.equal(res.headers.Location, _internals.ERROR_PATH, email);
    assert.equal(h.calls.forms.length + h.calls.ml.length, 0, email);
  }
});

test('missing fields are rejected', async () => {
  for (const f of [{ first_name: '' }, { email: '' }, { first_name: '   ' }]) {
    const h = harness();
    const res = await h.handler(post(f));
    assert.equal(res.headers.Location, _internals.ERROR_PATH);
    assert.equal(h.calls.forms.length + h.calls.ml.length, 0);
  }
  const h = harness();
  const noName = new URLSearchParams({ 'form-name': 'meal-blueprint', email: EMAIL }).toString();
  const res = await h.handler({ httpMethod: 'POST', headers: {}, body: noName });
  assert.equal(res.headers.Location, _internals.ERROR_PATH);
});

test('honeypot submissions look successful but process nothing', async () => {
  const h = harness();
  const res = await h.handler(post({ 'bot-field': 'i am a bot', marketing_consent: 'yes' }));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length + h.calls.ml.length, 0);
  assert.equal(h.store.m.size, 0);
});

test('unexpected form names and wrong methods are rejected', async () => {
  const h = harness();
  const res = await h.handler(post({ 'form-name': 'quiz-results' }));
  assert.equal(res.statusCode, 400);
  const res2 = await h.handler(post({ 'form-name': '' }));
  assert.equal(res2.statusCode, 400);
  const res3 = await h.handler({ httpMethod: 'GET', headers: {}, body: '' });
  assert.equal(res3.statusCode, 405);
  assert.equal(h.calls.forms.length + h.calls.ml.length, 0);
});

test('oversized body is rejected', async () => {
  const h = harness();
  const res = await h.handler(post({ first_name: 'x'.repeat(20000) }));
  assert.equal(res.statusCode, 413);
});

test('MailerLite API success is recorded in the outcome', async () => {
  const h = harness();
  await h.handler(post({ marketing_consent: 'yes' }));
  const outcomes = [...h.store.m.entries()].filter(([k]) => k.startsWith('outcome/'));
  assert.equal(outcomes.length, 1);
  assert.equal(outcomes[0][1].steps.mailerlite, 'done');
  assert.equal(outcomes[0][1].steps.netlify, 'done');
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 0);
});

test('MailerLite 500 and network errors are queued for retry; visitor still gets the resource', async () => {
  for (const ml of [[500], [429], ['throw']]) {
    const h = harness({ ml });
    const res = await h.handler(post({ marketing_consent: 'yes' }));
    assert.equal(res.headers.Location, THANKS);
    const pending = [...h.store.m.keys()].filter((k) => k.startsWith('pending/'));
    assert.equal(pending.length, 1, JSON.stringify(ml));
    assert.equal(h.store.m.get(pending[0]).steps.mailerlite, 'transient');
    assert.equal(h.store.m.get(pending[0]).steps.netlify, 'done');
  }
});

test('MailerLite 422 is a permanent failure: recorded, not queued', async () => {
  const h = harness({ ml: [422] });
  await h.handler(post({ marketing_consent: 'yes' }));
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 0);
  const out = [...h.store.m.entries()].find(([k]) => k.startsWith('outcome/'))[1];
  assert.equal(out.steps.mailerlite, 'failed_permanent');
});

test('retry completes a queued job without re-recording the Netlify submission', async () => {
  const h = harness({ ml: [500, 201] });
  await h.handler(post({ marketing_consent: 'yes' }));
  assert.equal(h.calls.forms.length, 1);
  const summary = await runRetry(h.deps);
  assert.equal(summary.completed, 1);
  assert.equal(h.calls.forms.length, 1, 'Netlify form must not be recorded twice');
  assert.equal(h.calls.ml.length, 2);
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 0);
});

test('retry gives up after the maximum attempts, drops the stored email and logs an error line', async () => {
  const h = harness({ ml: [500] });
  await h.handler(post({ marketing_consent: 'yes' }));
  for (let i = 0; i < _internals.MAX_ATTEMPTS + 2; i += 1) await runRetry(h.deps);
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 0);
  const failed = [...h.store.m.entries()].filter(([k]) => k.startsWith('failed/'));
  assert.equal(failed.length, 1);
  assert.ok(!JSON.stringify(failed[0][1]).includes(EMAIL));
  assert.ok(h.logs.some((l) => l.includes('retry_exhausted')));
});

test('Netlify Forms recording failure is queued and retried', async () => {
  const h = harness({ forms: [500, 200] });
  const res = await h.handler(post({}));
  assert.equal(res.headers.Location, THANKS);
  const pending = [...h.store.m.keys()].filter((k) => k.startsWith('pending/'));
  assert.equal(pending.length, 1);
  const summary = await runRetry(h.deps);
  assert.equal(summary.completed, 1);
  assert.equal(h.calls.forms.length, 2);
});

test('duplicate submissions inside 24 hours are processed once', async () => {
  const h = harness();
  await h.handler(post({ marketing_consent: 'yes' }));
  const res = await h.handler(post({ marketing_consent: 'yes', email: EMAIL.toUpperCase() }));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length, 1);
  assert.equal(h.calls.ml.length, 1);
});

test('same person later ticking consent is NOT treated as a duplicate', async () => {
  const h = harness();
  await h.handler(post({}));
  await h.handler(post({ marketing_consent: 'yes' }));
  assert.equal(h.calls.forms.length, 2);
  assert.equal(h.calls.ml.length, 1);
});

test('duplicate window expires after 24 hours', async () => {
  const h = harness();
  await h.handler(post({}));
  h.deps.now = () => 1_800_000_000_000 + _internals.DEDUPE_TTL_MS + 1;
  const later = createHandler(h.deps);
  await later(post({}));
  assert.equal(h.calls.forms.length, 2);
});

test('missing MailerLite env vars: consenting visitor still served, outcome says skipped_not_configured', async () => {
  for (const env of [{ URL: ORIGIN }, { URL: ORIGIN, MAILERLITE_API_KEY: KEY }, { URL: ORIGIN, MAILERLITE_BLUEPRINT_GROUP_ID: GROUP }]) {
    const h = harness({ env });
    const res = await h.handler(post({ marketing_consent: 'yes' }));
    assert.equal(res.headers.Location, THANKS);
    assert.equal(h.calls.ml.length, 0);
    assert.equal(h.calls.forms.length, 1);
    const out = [...h.store.m.entries()].find(([k]) => k.startsWith('outcome/'))[1];
    assert.equal(out.steps.mailerlite, 'skipped_not_configured');
  }
});

test('missing site URL and Host header: queued, visitor still served', async () => {
  const h = harness({ env: { MAILERLITE_API_KEY: KEY, MAILERLITE_BLUEPRINT_GROUP_ID: GROUP } });
  const res = await h.handler(post({}));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length, 0);
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 1);
});

test('blob store unavailable: still records and subscribes, logs retry_unavailable on failure', async () => {
  const h = harness({ store: null });
  const res = await h.handler(post({ marketing_consent: 'yes' }));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.forms.length, 1);
  assert.equal(h.calls.ml.length, 1);
  const h2 = harness({ store: null, ml: [500] });
  await h2.handler(post({ marketing_consent: 'yes' }));
  assert.ok(h2.logs.some((l) => l.includes('retry_unavailable')));
});

test('logs never contain the email address, the name or the API key', async () => {
  const h = harness({ ml: [500] });
  await h.handler(post({ marketing_consent: 'yes', first_name: 'Zebediah' }));
  await h.handler(post({ email: 'nope', first_name: 'Zebediah' }));
  await runRetry(h.deps);
  const all = h.logs.join('\n');
  assert.ok(all.length > 0);
  assert.ok(!all.includes('synthetic.tester'));
  assert.ok(!all.includes('Zebediah'));
  assert.ok(!all.includes(KEY));
  assert.ok(!all.includes('example.test'));
});

test('utm values are sanitized before being recorded', async () => {
  const h = harness();
  await h.handler(post({ utm_source: 'canvasrebel<script>', utm_medium: 'feature', utm_campaign: 'story2026' }));
  const sent = new URLSearchParams(h.calls.forms[0].opts.body);
  assert.equal(sent.get('utm_source'), 'canvasrebelscript');
  assert.equal(sent.get('utm_campaign'), 'story2026');
});

test('staging mode never contacts MailerLite even when credentials and consent are present', async () => {
  const h = harness();
  h.deps.staging = true;
  const handler = createHandler(h.deps);
  const res = await handler(post({ marketing_consent: 'yes' }));
  assert.equal(res.headers.Location, THANKS);
  assert.equal(h.calls.ml.length, 0);
  assert.equal(h.calls.forms.length, 1);
  const out = [...h.store.m.entries()].find(([k]) => k.startsWith('outcome/'))[1];
  assert.equal(out.steps.mailerlite, 'skipped_staging');
  assert.equal([...h.store.m.keys()].filter((k) => k.startsWith('pending/')).length, 0);
});
