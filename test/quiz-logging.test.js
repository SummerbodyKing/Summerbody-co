'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

test('quiz handler logs contain no email or name, and flag empty answers', async () => {
  for (const k of ['RESEND_API_KEY', 'MAILERLITE_API_KEY', 'MAILERLITE_GROUP_ID', 'FROM_EMAIL']) delete process.env[k];
  const lines = [];
  for (const m of ['log', 'warn', 'error']) console[m] = (...a) => lines.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
  const { handler } = require(path.join('..', 'netlify', 'functions', 'submission-created.js'));
  const body = JSON.stringify({ payload: { form_name: 'quiz-results', data: { first_name: 'Zed Testperson', email: 'zed.test@example.test', answers: '' } } });
  const res = await handler({ body });
  const out = lines.join('\n');
  assert.equal(res.statusCode, 200);
  assert.ok(!out.includes('zed.test@example.test'), 'email leaked into logs');
  assert.ok(!out.includes('Zed'), 'name leaked into logs');
  assert.ok(out.includes('quiz_no_answers'), 'empty answers must be flagged');
});
