// SWEAT DEPT PMP Command Center — AI Coach (serverless)
// Generates fresh, exam-style PMP questions targeted at the learner's weak spots.
// Requires a Netlify environment variable: ANTHROPIC_API_KEY
// Optional: CLAUDE_MODEL (defaults to a current Claude model)

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Front-end shows friendly setup instructions when it sees this.
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'not_configured' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (_) {}
  const domain = (body.domain || 'Business Environment').toString().slice(0, 60);
  const count = Math.min(Math.max(parseInt(body.count, 10) || 5, 1), 10);
  const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(body.difficulty) ? body.difficulty : 'mixed';
  const avoid = Array.isArray(body.avoidTopics) ? body.avoidTopics.slice(0, 40).join('; ') : '';

  const prompt =
`You are a PMP exam coach for the current PMI Exam Content Outline (ECO). Write ${count} brand-new, original, exam-realistic PMP practice questions in the "${domain}" domain at ${difficulty} difficulty.

Rules:
- Situational, single-best-answer style, exactly 4 options each.
- Reflect the PMI mindset: gather info first, servant leadership, never delay/escalate-first/reject, value-driven, refer to the plan and lessons learned.
- Cover varied sub-topics within the domain. Do NOT duplicate these already-used topics: ${avoid || '(none)'}.
- Each explanation must teach the principle and why the wrong options are wrong.

Return ONLY valid JSON, no prose, no markdown fences, in exactly this shape:
{"questions":[{"domain":"${domain}","difficulty":"medium","principle":"short tag","text":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":0,"explanation":"..."}]}
"answer" is the 0-based index of the correct option.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'api_error', status: resp.status, detail: detail.slice(0, 400) }) };
    }

    const data = await resp.json();
    let txt = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '';
    // strip accidental code fences and isolate the JSON object
    txt = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = txt.indexOf('{'); const end = txt.lastIndexOf('}');
    if (start >= 0 && end > start) txt = txt.slice(start, end + 1);

    let parsed;
    try { parsed = JSON.parse(txt); } catch (_) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'parse_error' }) };
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions.filter(q =>
      q && q.text && Array.isArray(q.options) && q.options.length === 4 &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    ) : [];

    return { statusCode: 200, headers, body: JSON.stringify({ questions }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'exception', detail: String(e).slice(0, 300) }) };
  }
};
