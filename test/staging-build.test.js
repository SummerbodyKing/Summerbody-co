'use strict';
// Tests for scripts/build-staging.js. Uses a throwaway fixture directory, never the real repo output.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO, 'scripts', 'build-staging.js');
const STAGING_SITE_ID = 'daaefbb5-f276-4bef-9ed7-da496d50151b';
const PROD_SITE_ID = 'e55293e7-3f7a-4a80-bc04-a3a7d5be8356';

function cleanEnv(extra) {
  const env = Object.assign({}, process.env);
  for (const k of Object.keys(env)) {
    if (/^(STRIPE_|MAILERLITE_|RESEND_API_KEY|NETLIFY|SITE_ID)/.test(k)) delete env[k];
  }
  return Object.assign(env, extra);
}

function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'staging-fixture-'));
  const w = (rel, content) => {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  };
  for (const f of ['blueprint/index.html', 'blueprint/thanks/index.html', 'blueprint/meal-blueprint.html']) w(f, `<html>${f}</html>`);
  w('index.html', '<html>home</html>');
  w('guide/index.html', '<a href="https://buy.stripe.com/abc123XYZ">buy</a><a href="https://buy.stripe.com/other_9">buy2</a>');
  w('guide/thanks/index.html', '<html>paid thanks</html>');
  w('guide/break-the-cycle.pdf', 'PAID PRODUCT');
  w('photos/a.jpg', 'x');
  fs.mkdirSync(path.join(dir, 'netlify', 'functions'), { recursive: true });
  for (const f of fs.readdirSync(path.join(REPO, 'netlify', 'functions'))) {
    fs.copyFileSync(path.join(REPO, 'netlify', 'functions', f), path.join(dir, 'netlify', 'functions', f));
  }
  return dir;
}

function run(dir, extraEnv) {
  return spawnSync(process.execPath, [SCRIPT], { env: cleanEnv(Object.assign({ STAGING_ROOT: dir }, extraEnv)), encoding: 'utf8' });
}

test('fixture contains the real Stripe webhook function so removal is meaningful', () => {
  const dir = makeFixture();
  assert.ok(fs.existsSync(path.join(dir, 'netlify/functions/stripe-purchase-hook.js')));
});

test('local build: sanitized static output, paid files excluded, noindex, functions copied without Stripe hook', () => {
  const dir = makeFixture();
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  const guide = fs.readFileSync(path.join(dir, 'dist/guide/index.html'), 'utf8');
  assert.ok(!guide.includes('buy.stripe.com'));
  assert.equal((guide.match(/#staging-checkout-disabled/g) || []).length, 2);
  assert.ok(!fs.existsSync(path.join(dir, 'dist/guide/break-the-cycle.pdf')));
  assert.ok(!fs.existsSync(path.join(dir, 'dist/guide/thanks')));
  for (const f of ['blueprint/index.html', 'blueprint/thanks/index.html', 'blueprint/meal-blueprint.html', 'index.html', 'photos/a.jpg']) {
    assert.ok(fs.existsSync(path.join(dir, 'dist', f)), f);
  }
  assert.match(fs.readFileSync(path.join(dir, 'dist/_headers'), 'utf8'), /X-Robots-Tag: noindex/);
  assert.match(fs.readFileSync(path.join(dir, 'dist/robots.txt'), 'utf8'), /Disallow: \//);
  const fn = path.join(dir, '.staging-functions');
  assert.ok(!fs.existsSync(path.join(fn, 'stripe-purchase-hook.js')));
  assert.ok(fs.existsSync(path.join(fn, 'blueprint-intake.js')));
  assert.ok(fs.existsSync(path.join(fn, 'blueprint-retry.mjs')));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fn, 'staging-config.json'), 'utf8')), { staging: true });
  // Local mode must not touch the working tree's real functions.
  assert.ok(fs.existsSync(path.join(dir, 'netlify/functions/stripe-purchase-hook.js')));
  assert.ok(!fs.existsSync(path.join(dir, 'netlify/functions/staging-config.json')));
});

test('on Netlify with the staging site id: functions are changed in place inside the build container', () => {
  const dir = makeFixture();
  const r = run(dir, { NETLIFY: 'true', SITE_ID: STAGING_SITE_ID });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!fs.existsSync(path.join(dir, 'netlify/functions/stripe-purchase-hook.js')));
  assert.ok(fs.existsSync(path.join(dir, 'netlify/functions/staging-config.json')));
});

test('on Netlify with the PRODUCTION site id: refuses and produces nothing', () => {
  const dir = makeFixture();
  const r = run(dir, { NETLIFY: 'true', SITE_ID: PROD_SITE_ID });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /refusing to run/);
  assert.ok(!fs.existsSync(path.join(dir, 'dist')));
  assert.ok(fs.existsSync(path.join(dir, 'netlify/functions/stripe-purchase-hook.js')), 'production functions untouched');
});

test('on Netlify with an unknown site id or none: refuses', () => {
  for (const env of [{ NETLIFY: 'true', SITE_ID: 'something-else' }, { NETLIFY: 'true' }]) {
    const dir = makeFixture();
    const r = run(dir, env);
    assert.notEqual(r.status, 0);
    assert.ok(!fs.existsSync(path.join(dir, 'dist')));
  }
});

test('production credential variables in the build environment abort the build without printing values', () => {
  const secret = 'value-that-must-never-be-printed-123';
  for (const name of ['MAILERLITE_API_KEY', 'MAILERLITE_BLUEPRINT_GROUP_ID', 'RESEND_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_ANYTHING']) {
    const dir = makeFixture();
    const r = run(dir, { [name]: secret });
    assert.notEqual(r.status, 0, name);
    assert.ok(r.stderr.includes(name), name);
    assert.ok(!r.stderr.includes(secret) && !r.stdout.includes(secret), `${name} value leaked`);
    assert.ok(!fs.existsSync(path.join(dir, 'dist')), name);
  }
});

test('a Stripe reference anywhere else in the output aborts the build', () => {
  const dir = makeFixture();
  fs.writeFileSync(path.join(dir, 'blueprint/index.html'), '<a href="https://buy.stripe.com/live">x</a>');
  const r = run(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Stripe reference still present/);
});

test('missing guide page aborts the build', () => {
  const dir = makeFixture();
  fs.rmSync(path.join(dir, 'guide/index.html'));
  const r = run(dir);
  assert.notEqual(r.status, 0);
});

test('staged function bundle never contacts MailerLite, even with MailerLite credentials present at runtime', () => {
  const esbuild = require('esbuild');
  const dir = makeFixture();
  assert.equal(run(dir).status, 0);
  const out = path.join(dir, 'intake.bundle.cjs');
  esbuild.buildSync({
    entryPoints: [path.join(dir, '.staging-functions/blueprint-intake.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: out,
    logLevel: 'silent',
    nodePaths: [path.join(REPO, 'node_modules')],
  });
  const driver = `
    const calls = [];
    globalThis.fetch = async (u) => { calls.push(String(u)); return { status: 200 }; };
    const { handler } = require(${JSON.stringify(out)});
    const body = new URLSearchParams({ 'form-name': 'meal-blueprint', first_name: 'Sam', email: 'synthetic@example.test', marketing_consent: 'yes' }).toString();
    handler({ httpMethod: 'POST', headers: { host: 'staging.example.test' }, body }).then((r) => {
      console.log(JSON.stringify({ status: r.statusCode, location: r.headers.Location, calls }));
    });`;
  const r = spawnSync(process.execPath, ['-e', driver], {
    env: cleanEnv({ MAILERLITE_API_KEY: 'leaked-test-key', MAILERLITE_BLUEPRINT_GROUP_ID: 'leaked-test-group', URL: 'https://staging.example.test' }),
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  const result = JSON.parse(r.stdout.trim().split('\n').pop());
  assert.equal(result.status, 303);
  assert.equal(result.location, '/blueprint/thanks/');
  assert.ok(result.calls.some((u) => u === 'https://staging.example.test/'), 'Netlify Forms recording still happens');
  assert.ok(!result.calls.some((u) => u.includes('mailerlite')), 'MailerLite must not be contacted in staging');
});
