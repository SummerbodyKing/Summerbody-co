const BRAND = {
  primary: '#F15002',
  dark: '#000000',
  white: '#FFFFFF',
  smoke: '#F5F5F5',
  border: '#E5E5E5',
  muted: '#666666',
};

const HEADING_FONT = "'Anton', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const BODY_FONT = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tipCard(tip, index) {
  const num = String(index + 1).padStart(2, '0');
  return `
  <tr>
    <td style="padding: 0 0 16px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.smoke}; border-left: 6px solid ${BRAND.primary};">
        <tr>
          <td style="padding: 22px 24px;">
            <div style="font-family:${HEADING_FONT}; font-size:12px; letter-spacing:2px; color:${BRAND.primary}; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
              ${escapeHtml(tip.pillar || `Pillar ${num}`)}
            </div>
            <div style="font-family:${BODY_FONT}; font-size:14px; color:${BRAND.dark}; font-weight:600; line-height:1.4; margin-bottom:6px;">
              ${escapeHtml(tip.question || '')}
            </div>
            <div style="font-family:${BODY_FONT}; font-size:13px; color:${BRAND.muted}; font-style:italic; margin-bottom:14px;">
              Your answer: ${escapeHtml(tip.answer || '')}
            </div>
            <div style="font-family:${BODY_FONT}; font-size:15px; color:${BRAND.dark}; line-height:1.6;">
              ${escapeHtml(tip.take || '')}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildEmailHtml({ firstName, tipsArray, ebookUrl, skoolUrl }) {
  const safeName = escapeHtml(firstName || 'Friend');
  const cards = tipsArray.map((t, i) => tipCard(t, i)).join('\n');
  const ebookLink = ebookUrl || 'https://www.sweatdepartment.com/';
  const skoolLink = skoolUrl || 'https://www.skool.com/';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your SWEAT DEPARTMENT 5-Pillar Plan</title>
</head>
<body style="margin:0; padding:0; background:${BRAND.smoke}; font-family:${BODY_FONT}; color:${BRAND.dark};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.smoke};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:${BRAND.white};">

        <tr>
          <td style="background:${BRAND.dark}; padding:16px 32px; text-align:left; border-top:4px solid ${BRAND.primary};">
            <div style="font-family:${BODY_FONT}; font-size:13px; letter-spacing:4px; color:${BRAND.white}; font-weight:500; text-transform:uppercase;">
              Sweat <span style="color:${BRAND.primary};">Department</span>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 32px 8px 32px;">
            <h1 style="margin:0 0 16px 0; font-family:${HEADING_FONT}; font-size:34px; line-height:1.15; color:${BRAND.dark}; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
              ${safeName}, here's your<br>
              <span style="color:${BRAND.primary};">5-Pillar plan.</span>
            </h1>
            <p style="margin:0 0 12px 0; font-family:${BODY_FONT}; font-size:16px; line-height:1.6; color:${BRAND.dark};">
              You took the quiz. I read your answers. Below are five takes built specifically off of what you told me, one per pillar.
            </p>
            <p style="margin:0 0 24px 0; font-family:${BODY_FONT}; font-size:16px; line-height:1.6; color:${BRAND.dark};">
              I lost 180 pounds naturally with these exact pillars. No weight-loss surgery. No Ozempic. No quitting on myself. Read these once tonight. Read them again tomorrow morning. Then pick ONE and run it for 7 days.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${cards}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.dark};">
              <tr>
                <td style="padding:28px 24px; text-align:center;">
                  <div style="font-family:${HEADING_FONT}; font-size:22px; color:${BRAND.white}; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
                    Want the full playbook?
                  </div>
                  <div style="font-family:${BODY_FONT}; font-size:14px; color:${BRAND.white}; opacity:0.85; line-height:1.6; margin-bottom:18px;">
                    The 5-Pillar Quick Start Guide is the same one I used to drop 180 lbs.
                  </div>
                  <a href="${escapeHtml(ebookLink)}" style="display:inline-block; background:${BRAND.primary}; color:${BRAND.white}; font-family:${BODY_FONT}; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; text-decoration:none; padding:14px 28px; border-radius:2px;">
                    Get the Quick Start Guide
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 32px 24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.smoke}; border:1px solid ${BRAND.border};">
              <tr>
                <td style="padding:24px; text-align:center;">
                  <div style="font-family:${HEADING_FONT}; font-size:18px; color:${BRAND.dark}; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    Roll with the team.
                  </div>
                  <div style="font-family:${BODY_FONT}; font-size:14px; color:${BRAND.dark}; line-height:1.6; margin-bottom:14px;">
                    Free community. Daily accountability. Weekly check-ins.
                  </div>
                  <a href="${escapeHtml(skoolLink)}" style="display:inline-block; background:${BRAND.dark}; color:${BRAND.white}; font-family:${BODY_FONT}; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; text-decoration:none; padding:12px 24px; border-radius:2px;">
                    Join Team SUMMERBODY (Free)
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px 36px 32px; border-top:1px solid ${BRAND.border};">
            <p style="margin:0 0 8px 0; font-family:${BODY_FONT}; font-size:14px; line-height:1.6; color:${BRAND.dark};">
              Win the next meal. Then the next. Then the day.
            </p>
            <p style="margin:0; font-family:${BODY_FONT}; font-size:14px; line-height:1.6; color:${BRAND.dark}; font-weight:700;">
              KING SUMMERBODY
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:${BRAND.dark}; padding:18px 32px; text-align:center;">
            <div style="font-family:${BODY_FONT}; font-size:11px; color:${BRAND.white}; opacity:0.6; line-height:1.6;">
              SWEAT DEPARTMENT LLC. &middot; You're getting this because you took the 5-Pillar Quiz.<br>
              Reply to this email if you have a question. A human reads every reply.
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildEmailText({ firstName, tipsArray, ebookUrl, skoolUrl }) {
  const safeName = firstName || 'Friend';
  const lines = [];
  lines.push(`${safeName}, here's your 5-Pillar plan.`);
  lines.push('');
  lines.push('You took the quiz. I read your answers. Below are five takes built specifically off of what you told me, one per pillar.');
  lines.push('');
  lines.push('I lost 180 pounds naturally with these exact pillars. No weight-loss surgery. No Ozempic. No quitting on myself. Read these once tonight. Read them again tomorrow morning. Then pick ONE and run it for 7 days.');
  lines.push('');
  tipsArray.forEach((t, i) => {
    lines.push('---');
    lines.push((t.pillar || `Pillar ${i + 1}`).toUpperCase());
    lines.push(t.question || '');
    lines.push(`Your answer: ${t.answer || ''}`);
    lines.push('');
    lines.push(t.take || '');
    lines.push('');
  });
  lines.push('---');
  lines.push('Want the full playbook? Get the 5-Pillar Quick Start Guide:');
  lines.push(ebookUrl || 'https://www.sweatdepartment.com/');
  lines.push('');
  lines.push('Roll with the team. Join Team SUMMERBODY (free):');
  lines.push(skoolUrl || 'https://www.skool.com/');
  lines.push('');
  lines.push('Win the next meal. Then the next. Then the day.');
  lines.push('KING SUMMERBODY');
  return lines.join('\n');
}

module.exports = { buildEmailHtml, buildEmailText };
