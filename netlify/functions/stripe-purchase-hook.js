// Stripe -> MailerLite webhook.
// Endpoint: /.netlify/functions/stripe-purchase-hook
// Configure this URL in Stripe Dashboard -> Developers -> Webhooks, listen for `checkout.session.completed`.

const Stripe = require('stripe');

exports.handler = async (event) => {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
  const MAILERLITE_BUYERS_GROUP_ID = process.env.MAILERLITE_BUYERS_GROUP_ID;

  console.log('stripe_hook_env_check', {
    has_STRIPE_WEBHOOK_SECRET: !!STRIPE_WEBHOOK_SECRET,
    has_STRIPE_SECRET_KEY: !!STRIPE_SECRET_KEY,
    has_MAILERLITE_API_KEY: !!MAILERLITE_API_KEY,
    has_MAILERLITE_BUYERS_GROUP_ID: !!MAILERLITE_BUYERS_GROUP_ID,
    netlify_context: process.env.CONTEXT,
    deploy_id: process.env.DEPLOY_ID,
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'method not allowed' };
  }

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
    console.error('stripe_hook_missing_env');
    return { statusCode: 500, body: 'server misconfigured' };
  }

  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!signature) {
    console.error('stripe_hook_missing_signature');
    return { statusCode: 400, body: 'missing signature' };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('stripe_signature_verify_failed', { message: e.message });
    return { statusCode: 400, body: `signature verify failed: ${e.message}` };
  }

  console.log('stripe_event_received', {
    id: stripeEvent.id,
    type: stripeEvent.type,
    livemode: stripeEvent.livemode,
  });

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: `ignored: ${stripeEvent.type}` };
  }

  const session = stripeEvent.data.object || {};

  if (session.payment_status !== 'paid') {
    console.log('stripe_session_not_paid', { payment_status: session.payment_status });
    return { statusCode: 200, body: `ignored: payment_status=${session.payment_status}` };
  }

  const email = String(
    (session.customer_details && session.customer_details.email) ||
    session.customer_email ||
    ''
  ).trim();

  const fullName = String((session.customer_details && session.customer_details.name) || '').trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : 'Friend';

  if (!email || !email.includes('@')) {
    console.error('stripe_hook_invalid_email', { email });
    return { statusCode: 200, body: 'no valid email on session' };
  }

  console.log('stripe_purchase_capture', {
    email: maskEmail(email),
    firstName,
    amount_total: session.amount_total,
    currency: session.currency,
    session_id: session.id,
  });

  const mlResult = await pushMailerLiteBuyer({
    apiKey: MAILERLITE_API_KEY,
    groupId: MAILERLITE_BUYERS_GROUP_ID,
    email,
    firstName,
    amountTotal: session.amount_total,
    sessionId: session.id,
  });

  console.log('stripe_purchase_processed', {
    email: maskEmail(email),
    firstName,
    mailerlite: summarizeResult(mlResult),
  });

  return { statusCode: 200, body: 'ok' };
};

function maskEmail(s) {
  return String(s).replace(/(.{0,4}).*?(@.*)/, '$1...$2');
}

function summarizeResult(r) {
  if (!r) return 'no_result';
  if (r.ok) return 'ok';
  if (r.skipped) return `skipped:${r.reason || 'unknown'}`;
  return `fail:${(r.error || '').slice(0, 200)}`;
}

async function pushMailerLiteBuyer({ apiKey, groupId, email, firstName, amountTotal, sessionId }) {
  if (!apiKey) return { ok: false, skipped: true, reason: 'no_mailerlite_api_key' };
  if (!groupId) return { ok: false, skipped: true, reason: 'no_mailerlite_buyers_group_id' };

  const fields = {
    name: firstName,
    btc_purchased: 'yes',
    btc_purchase_amount_cents: String(amountTotal || ''),
    btc_stripe_session_id: sessionId || '',
    btc_purchased_at: new Date().toISOString(),
  };

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
