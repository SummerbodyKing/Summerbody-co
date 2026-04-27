const { Resend } = require('resend');
const tips = require('./tips.json');
const { buildEmailHtml, buildEmailText } = require('./email-template');

exports.handler = async (event) => {
  const FROM_EMAIL = process.env.FROM_EMAIL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
  const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
  const EBOOK_URL = process.env.EBOOK_URL;
  const SKOOL_URL = process.env.SKOOL_URL;

  console.log('env_check', {
    has_FROM_EMAIL: !!FROM_EMAIL,
    FROM_EMAIL_len: (FROM_EMAIL || '').length,
    FROM_EMAIL_preview: FROM_EMAIL ? maskEmail(FROM_EMAIL) : null,
    has_RESEND_API_KEY: !!RESEND_API_KEY,
    RESEND_API_KEY_len: (RESEND_API_KEY || '').length,
    has_MAILERLITE_API_KEY: !!MAILERLITE_API_KEY,
    has_MAILERLITE_GROUP_ID: !!MAILERLITE_GROUP_ID,
    has_EBOOK_URL: !!EBOOK_URL,
    has_SKOOL_URL: !!SKOOL_URL,
    netlify_context: process.env.CONTEXT,
    deploy_id: process.env.DEPLOY_ID,
    node_version: process.version,
  });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    console.error('parse_error', { message: e.message });
    return { statusCode: 400, body: 'invalid json' };
  }

  const payload = body.payload || body;
  const data = payload.data || payload;

  console.log('payload_meta', {
    form_name: payload.form_name,
    data_keys: data ? Object.keys(data) : [],
    data_email_present: !!(data && data.email),
  });

  if (payload.form_name && payload.form_name !== 'quiz-results') {
    console.log('skip_wrong_form', { form_name: payload.form_name });
    return { statusCode: 200, body: 'skipped: wrong form' };
  }

  const email = String((data && data.email) || '').trim();
  const firstName = String(
    (data && (data.first_name || data.firstName || data.name)) || 'Friend'
  ).trim();

  if (!email || !email.includes('@')) {
    console.error('invalid_email', { email });
    return { statusCode: 400, body: 'invalid email' };
  }

  const answers = parseAnswers(data || {});
  console.log('answers_parsed', {
    count: answers.length,
    pairs: answers.map((a) => `${a.q}=${(a.a || '').slice(0, 40)}`),
  });

  const tipsArray = answers
    .map(({ q, a }) => {
      const qBlock = tips[q];
      if (!qBlock) return null;
      const aBlock = qBlock[a];
      if (!aBlock) {
        console.warn('answer_not_in_tips', { q, a });
        return null;
      }
      return {
        question: qBlock._question,
        pillar: qBlock._pillar,
        answer: a,
        take: aBlock.take,
      };
    })
    .filter(Boolean);

  console.log('tips_built', { count: tipsArray.length });

  const resendResult = await sendResendEmail({
    apiKey: RESEND_API_KEY,
    fromEmail: FROM_EMAIL,
    toEmail: email,
    firstName,
    tipsArray,
    ebookUrl: EBOOK_URL,
    skoolUrl: SKOOL_URL,
  });

  const mlResult = await pushMailerLite({
    apiKey: MAILERLITE_API_KEY,
    groupId: MAILERLITE_GROUP_ID,
    email,
    firstName,
    tipsArray,
  });

  console.log('quiz_submission_processed', {
    email,
    firstName,
    tips_count: tipsArray.length,
    resend: summarizeResult(resendResult),
    mailerlite: summarizeResult(mlResult),
  });

  return { statusCode: 200, body: 'ok' };
};

function maskEmail(s) {
  return String(s).replace(/(.{0,4}).*?(@.*)/, '$1...$2');
}

function summarizeResult(r) {
  if (!r) return 'no_result';
  if (r.ok) return `ok${r.id ? `:${r.id}` : ''}`;
  if (r.skipped) return `skipped:${r.reason || 'unknown'}`;
  return `fail:${(r.error || '').slice(0, 200)}`;
}

function parseAnswers(data) {
  if (typeof data.answers === 'string' && data.answers.trim()) {
    return parseCombinedAnswers(data.answers);
  }
  const out = [];
  for (let i = 1; i <= 5; i++) {
    const variants = [`q${i}`, `Q${i}`, `q${i}_answer`, `question${i}`, `quiz_q${i}`];
    for (const v of variants) {
      if (data[v] != null && String(data[v]).trim() !== '') {
        out.push({ q: `Q${i}`, a: String(data[v]).trim() });
        break;
      }
    }
  }
  return out;
}

function parseCombinedAnswers(s) {
  const out = [];
  const segments = s.split(/(?=Q\d+\s*[:\-])/i);
  for (const seg of segments) {
    const m = seg.match(/Q(\d+)\s*[:\-].*?\|\s*A\s*[:\-]\s*(.+?)(?=\s*$|\s*Q\d+\s*[:\-])/is);
    if (m) {
      out.push({ q: `Q${m[1]}`, a: m[2].trim() });
    }
  }
  return out;
}

async function sendResendEmail({ apiKey, fromEmail, toEmail, firstName, tipsArray, ebookUrl, skoolUrl }) {
  if (!apiKey) return { ok: false, skipped: true, reason: 'no_resend_api_key' };
  if (!fromEmail) return { ok: false, skipped: true, reason: 'no_from_email_env' };
  if (!tipsArray || tipsArray.length === 0) return { ok: false, skipped: true, reason: 'no_tips' };

  try {
    const resend = new Resend(apiKey);
    const html = buildEmailHtml({ firstName, tipsArray, ebookUrl, skoolUrl });
    const text = buildEmailText({ firstName, tipsArray, ebookUrl, skoolUrl });
    const subject = `${firstName}, your personalized 5-Pillar plan is here`;

    console.log('resend_send_attempt', {
      from_preview: maskEmail(fromEmail),
      to_preview: maskEmail(toEmail),
      subject,
      html_len: html.length,
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      return { ok: false, error: JSON.stringify(result.error) };
    }
    return { ok: true, id: result.data && result.data.id };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

async function pushMailerLite({ apiKey, groupId, email, firstName, tipsArray }) {
  if (!apiKey) return { ok: false, skipped: true, reason: 'no_mailerlite_api_key' };
  if (!groupId) return { ok: false, skipped: true, reason: 'no_mailerlite_group_id' };

  const fields = { name: firstName };
  tipsArray.forEach((t, i) => {
    const idx = i + 1;
    fields[`quiz_q${idx}_answer`] = t.answer || '';
    fields[`quiz_q${idx}_take`] = t.take || '';
    fields[`quiz_q${idx}_pillar`] = t.pillar || '';
  });

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        fields,
        groups: [groupId],
        status: 'active',
      }),
    });

    if (response.ok) {
      return { ok: true };
    }
    const errBody = await response.text();
    return { ok: false, error: `${response.status}: ${errBody.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}
