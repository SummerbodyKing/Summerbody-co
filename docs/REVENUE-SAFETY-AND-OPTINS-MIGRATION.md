# SWEAT DEPT. Revenue and Migration Safety Plan
Date: 2026-11-01
Status: PROPOSED ONLY. No production changes authorized.

## Production baseline
Repository: SummerbodyKing/Summerbody-co
Source branch: claude/setup-quiz-email-mbZOq
Production commit reported by Netlify: 3b242fa
Do not merge into main: it contains unrelated career materials.
Before deployment, verify current Netlify production commit and obtain rollback deploy ID.

## P0: Verify $2.97 guide fulfillment
1. Inspect guide/index.html payment destination and guide/thanks/index.html download.
2. Confirm guide/break-the-cycle.pdf exists and is downloadable.
3. In Stripe dashboard, verify checkout.session.completed webhook URL, signature secret, enabled status, and recent delivery events. Do not print secrets.
4. Check Netlify function logs for stripe-purchase-hook and submission-created. Record timestamps and errors without customer PII.
5. In MailerLite, confirm buyer group and automation activation, with a test address.
6. Test with Stripe test mode when feasible; never claim production payment works based solely on code.
7. Verify EBOOK_URL destination; don't overwrite until its intended semantics are confirmed.

## P1: Preserve Optins traffic
Current short routes /free, /reset, /canvasrebel target kingsummerbody-1.optins.com.
Before cancellation: capture content, media, forms, consent text, destination and UTM behavior for both funnels.
Build replacement pages on staging with opt-in, email delivery and consent. Test first.
Only then change redirects, preferably using temporary 302 during migration before permanent 301.

## P1: Monitoring
Add safe failure alerts for Netlify Functions and form-to-email delivery.
Avoid storing personal health responses in public logs, GitHub or broad-access sheets.
Create a daily synthetic test for form delivery with explicit test labeling, avoiding unwanted customer email.
Define owner and escalation path for failed payment delivery.

## P1: Publishing workflow
One approved editorial calendar in Google Sheets.
Drive for media and approved copy; Asana for status; GitHub for site code.
Marblism drafts; a human approves before public posting.
Track source asset, target audience, offer CTA, assigned agent, review status, scheduled date, published URL and metrics.

## P2: Repository hygiene
Audit public files for private career and client material; preserve history before privacy changes.
Separate portfolio/job-search artifacts from commercial website.
Make the production source explicit, with protected branch and documented rollback.
Do not assume a GitHub push auto-deploys: verify Netlify source and deployment triggers.

## Acceptance criteria
- Buyer receives correct PDF and follow-up, verified by test evidence.
- Lead opt-in and email delivery both work.
- No production shortlink points to a retired service.
- Staging and production deploy sources are documented.
- Publishing pipeline produces one approved, verifiably live article with a tracked CTA.

## Pending external checks
Netlify environment-variable presence (names only), Stripe webhook delivery, MailerLite group and automation status, Optins account contents, Cloudflare nameservers, Netlify deploy source and rollback path.
