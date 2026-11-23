# No-Math Blueprint: Test and Launch Gate
Status: staged in draft PR #17. Staging project created, NOT yet deployed. Code and local browser tests pass. See docs/STAGING-AND-INTEGRATION.md.
Production branch: claude/setup-quiz-email-mbZOq
Working branch: audit/sweatdept-revenue-safety-2026-11-01

## Current build
- /blueprint/ landing page with Netlify form meal-blueprint and optional marketing consent.
- /blueprint/thanks/ access page.
- /blueprint/meal-blueprint.html resource page.
- Existing /free and /canvasrebel still point to Optins. No production redirects changed.

## Important blockers
1. Netlify Forms must detect the form on a deployed HTML page. GitHub file presence alone does not activate it.
2. MailerLite handler is written and passes mocked tests (netlify/functions/blueprint-intake.js). It has NOT been tested against live MailerLite and needs the group ID. Do not claim live enrollment.
3. Do not reuse quiz-results function for this form. It parses quiz answers and would send incorrect content.
4. Opt-in is optional: do not add non-consenting downloaders to marketing lists.
5. Resource page is accessible via URL, appropriate for a free lead magnet; not a secure paid-content gate.
6. Live production uses an API-sourced deploy. A GitHub PR does not guarantee a preview or automatic deployment.

## Staging acceptance checklist
- [ ] Link project sweatdept-staging-blueprint to this branch with `npm run build:staging` (see docs/STAGING-AND-INTEGRATION.md section 1).
- [ ] Confirm /blueprint/ and /blueprint/thanks/ render on mobile and desktop.
- [ ] Submit a synthetic test address; confirm Netlify Forms records one submission.
- [ ] Verify thank-you page link resolves and resource is readable.
- [ ] Confirm marketing-consent unchecked remains unchecked in submission.
- [ ] Implement separate consent-aware MailerLite integration with retry and alerting, then test both opt-in and non-opt-in cases.
- [ ] Confirm no customer emails or health answers appear in public logs.
- [ ] Validate link tracking and accessibility.
- [ ] Document rollback deploy and production source.
- [ ] Only after approval, replace /free and /canvasrebel redirects with temporary 302s; monitor, then finalize.

## Responsibility
Assistant: stage source, review code, document test cases and prepare safe changes.
Owner: authorize staging deployment and connect/verify Netlify or MailerLite access where needed.
No payment or live customer data required for staging test.
