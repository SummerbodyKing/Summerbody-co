'use strict';

// Verifies the output of scripts/build-staging.js. Run: npm run verify:staging
// Fails (exit 1) if staging output could expose production payment, paid files, or secrets,
// or if the functions do not bundle with @netlify/blobs.

const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(process.env.STAGING_ROOT || path.join(__dirname, '..'));
const dist = path.join(root, 'dist');
const functionsDir = process.env.NETLIFY === 'true'
  ? path.join(root, 'netlify', 'functions')
  : path.join(root, '.staging-functions');

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail || '' });
}
const exists = (p) => fs.existsSync(p);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

// ---- static output ----
check('dist exists', exists(dist));
for (const f of ['blueprint/index.html', 'blueprint/thanks/index.html', 'blueprint/meal-blueprint.html', 'guide/index.html', 'index.html']) {
  check(`dist/${f} present`, exists(path.join(dist, f)));
}
const headers = exists(path.join(dist, '_headers')) ? fs.readFileSync(path.join(dist, '_headers'), 'utf8') : '';
check('noindex header applied to every path', /^\/\*\s*\n\s*X-Robots-Tag:\s*noindex/m.test(headers));
check('robots.txt disallows all', exists(path.join(dist, 'robots.txt')) && /Disallow:\s*\//.test(fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8')));
check('paid PDF not in output', !exists(path.join(dist, 'guide', 'break-the-cycle.pdf')) && !exists(path.join(dist, 'guide', 'thanks')));
let stripeHits = [];
if (exists(dist)) {
  for (const file of walk(dist)) {
    if (!/\.(html|js|json|txt|xml|css)$/i.test(file) && path.basename(file) !== '_headers') continue;
    const text = fs.readFileSync(file, 'utf8');
    if (/buy\.stripe\.com|\bpk_live_|\bsk_live_|\bwhsec_[A-Za-z0-9]/.test(text)) stripeHits.push(path.relative(root, file));
  }
}
check('no Stripe checkout link or key in output', stripeHits.length === 0, stripeHits.join(', '));
const guidePath = path.join(dist, 'guide', 'index.html');
check('guide checkout button disabled', exists(guidePath) && fs.readFileSync(guidePath, 'utf8').includes('#staging-checkout-disabled'));

// ---- functions ----
check('functions output exists', exists(functionsDir), path.relative(root, functionsDir));
check('stripe-purchase-hook not in staging functions', exists(functionsDir) && !exists(path.join(functionsDir, 'stripe-purchase-hook.js')));
const cfgPath = path.join(functionsDir, 'staging-config.json');
let cfg = null;
try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch (e) { /* reported below */ }
check('staging-config.json sets staging true', cfg && cfg.staging === true);
for (const f of ['blueprint-intake.js', 'blueprint-retry.mjs']) {
  check(`${f} present`, exists(path.join(functionsDir, f)));
}

// ---- bundling, including @netlify/blobs ----
let esbuild = null;
try { esbuild = require('esbuild'); } catch (e) { check('esbuild available for bundle check', false, 'npm install esbuild (devDependency)'); }
check('@netlify/blobs installed', exists(path.join(root, 'node_modules', '@netlify', 'blobs', 'package.json')));
if (esbuild && exists(functionsDir)) {
  const BLOBS_MARKER = 'The `getStore` method requires the name of the store';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'staging-bundle-'));
  for (const f of ['blueprint-intake.js', 'blueprint-retry.mjs']) {
    const entry = path.join(functionsDir, f);
    if (!exists(entry)) continue;
    const out = path.join(tmp, `${f}.bundle.cjs`);
    try {
      esbuild.buildSync({
        entryPoints: [entry],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        outfile: out,
        logLevel: 'silent',
        nodePaths: [path.join(root, 'node_modules')],
      });
      const text = fs.readFileSync(out, 'utf8');
      check(`${f} bundles`, true, `${Math.round(text.length / 1024)} KB`);
      check(`${f} bundle contains @netlify/blobs code`, text.includes(BLOBS_MARKER));
      check(`${f} bundle has no Stripe references`, !/stripe/i.test(text));
      check(`${f} bundle has no hardcoded credentials`, !/\bre_[A-Za-z0-9]{20,}|\bsk_(live|test)_|\bwhsec_[A-Za-z0-9]/.test(text));
    } catch (e) {
      check(`${f} bundles`, false, String(e.message).split('\n')[0]);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

const failed = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? `  (${c.detail})` : ''}`);
console.log(`verify-staging: ${checks.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
