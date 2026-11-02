'use strict';

// STAGING-ONLY build. Command: npm run build:staging
//
// Produces `dist/` (the publish directory) from the blueprint funnel plus the pages it links to,
// with production payment, secrets and paid files left out. It is meant for the Netlify project
// `sweatdept-staging-blueprint` only and refuses to run anywhere else on Netlify.
//
// What it does:
//   1. Safety checks: wrong Netlify site, or production credentials present in the build environment, abort the build.
//   2. Copies blueprint/, guide/index.html, index.html and photos/ into dist/. The paid PDF and the post-purchase
//      thank-you page are NOT copied.
//   3. Disables the live Stripe Payment Link in dist/guide/index.html and checks no Stripe URL or key remains.
//   4. Writes dist/_headers (noindex) and dist/robots.txt.
//   5. Functions: staging gets everything except stripe-purchase-hook.js, plus staging-config.json, which switches
//      MailerLite off in blueprint-intake.js.
//        - On Netlify (NETLIFY=true) this is applied in place to netlify/functions inside the build container only.
//        - Anywhere else it is written to .staging-functions/ and your working tree is not modified.
//
// Test hook: STAGING_ROOT points the script at another directory (used by test/staging-build.test.js).

const fs = require('fs');
const path = require('path');

const STAGING_SITE_ID = 'daaefbb5-f276-4bef-9ed7-da496d50151b';
const STAGING_SITE_NAME = 'sweatdept-staging-blueprint';
const FORBIDDEN_ENV_EXACT = [
  'MAILERLITE_API_KEY',
  'MAILERLITE_GROUP_ID',
  'MAILERLITE_BLUEPRINT_GROUP_ID',
  'MAILERLITE_BUYERS_GROUP_ID',
  'RESEND_API_KEY',
];
const FORBIDDEN_ENV_PREFIX = ['STRIPE_'];
const STRIPE_LINK = /https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]*/g;
const STRIPE_LEFTOVERS = [/buy\.stripe\.com/i, /\bpk_live_/, /\bsk_live_/, /\brk_live_/, /\bwhsec_[A-Za-z0-9]/];

function fail(message) {
  console.error(`build-staging: ${message}`);
  process.exit(1);
}

const root = path.resolve(process.env.STAGING_ROOT || path.join(__dirname, '..'));
const onNetlify = process.env.NETLIFY === 'true';
const env = process.env;

// ---- 1. safety checks ----
if (onNetlify) {
  if (env.SITE_ID !== STAGING_SITE_ID) {
    fail(`refusing to run: this build belongs to a Netlify site that is not ${STAGING_SITE_NAME}. Remove this build command from that site.`);
  }
}
const leaked = Object.keys(env).filter(
  (k) => FORBIDDEN_ENV_EXACT.includes(k) || FORBIDDEN_ENV_PREFIX.some((p) => k.startsWith(p))
);
if (leaked.length) {
  fail(`production credential variables are present in the build environment: ${leaked.join(', ')}. Delete or unscope them for this project. Values were not read or printed.`);
}

// ---- helpers ----
const rel = (p) => path.relative(root, p) || '.';
function copyInto(dist, item, { required = true } = {}) {
  const from = path.join(root, item);
  if (!fs.existsSync(from)) {
    if (required) fail(`missing required source: ${item}`);
    return;
  }
  fs.cpSync(from, path.join(dist, item), { recursive: true });
}
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ---- 2. static output ----
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyInto(dist, 'blueprint');
copyInto(dist, 'index.html');
copyInto(dist, 'photos', { required: false });
// Guide: sales page only. Never the paid PDF or the post-purchase page.
fs.mkdirSync(path.join(dist, 'guide'), { recursive: true });
if (!fs.existsSync(path.join(root, 'guide', 'index.html'))) fail('missing required source: guide/index.html');
fs.copyFileSync(path.join(root, 'guide', 'index.html'), path.join(dist, 'guide', 'index.html'));

// ---- 3. disable live Stripe checkout ----
const guidePath = path.join(dist, 'guide', 'index.html');
const guideHtml = fs.readFileSync(guidePath, 'utf8').replace(STRIPE_LINK, '#staging-checkout-disabled');
fs.writeFileSync(guidePath, guideHtml);
for (const file of walk(dist)) {
  if (!/\.(html|js|json|txt|css|xml)$/i.test(file) && path.basename(file) !== '_headers') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const re of STRIPE_LEFTOVERS) {
    if (re.test(text)) fail(`Stripe reference still present in ${rel(file)} after sanitizing`);
  }
}

// ---- 4. noindex ----
fs.writeFileSync(path.join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Referrer-Policy: no-referrer\n');
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

// ---- 5. functions ----
const srcFunctions = path.join(root, 'netlify', 'functions');
if (!fs.existsSync(srcFunctions)) fail('missing netlify/functions');
const REMOVE_FUNCTIONS = ['stripe-purchase-hook.js'];
const stagingConfig = JSON.stringify({ staging: true }) + '\n';
let functionsOut;
if (onNetlify) {
  functionsOut = srcFunctions; // in place, inside the Netlify build container only
  for (const f of REMOVE_FUNCTIONS) fs.rmSync(path.join(srcFunctions, f), { force: true });
} else {
  functionsOut = path.join(root, '.staging-functions');
  fs.rmSync(functionsOut, { recursive: true, force: true });
  fs.cpSync(srcFunctions, functionsOut, { recursive: true });
  for (const f of REMOVE_FUNCTIONS) fs.rmSync(path.join(functionsOut, f), { force: true });
}
fs.writeFileSync(path.join(functionsOut, 'staging-config.json'), stagingConfig);
for (const f of REMOVE_FUNCTIONS) {
  if (fs.existsSync(path.join(functionsOut, f))) fail(`${f} is still present in the staging functions`);
}

console.log(JSON.stringify({
  ok: true,
  mode: onNetlify ? 'netlify-in-place' : 'local-copy',
  publishDir: 'dist',
  functionsDir: rel(functionsOut),
  removedFunctions: REMOVE_FUNCTIONS,
  excludedFromStatic: ['guide/break-the-cycle.pdf', 'guide/thanks/'],
}));
