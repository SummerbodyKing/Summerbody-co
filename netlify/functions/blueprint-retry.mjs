// Scheduled retry for blueprint-intake. Runs every 15 minutes on the published deploy.
// It only touches queued jobs (temporary Netlify Forms or MailerLite failures).
import intake from './blueprint-intake.js';

export default async () => {
  const summary = await intake.runRetry();
  return new Response(JSON.stringify(summary), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const config = { schedule: '*/15 * * * *' };
