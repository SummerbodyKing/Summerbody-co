# Sprint 2: Staging, Consent-Aware Lead Capture, and Test Evidence
Date: 2026-11-01
Branch: audit/sweatdept-revenue-safety-2026-11-01 (draft PR #17, unmerged)
Production: untouched. Live deploy 6a7879c481f2f900092251dc, branch claude/setup-quiz-email-mbZOq, commit 3b242fa.

## 1. Staging architecture
- Separate Netlify project: `sweatdept-staging-blueprint` (id daaefbb5-f276-4bef-9ed7-da496d50151b), same team, no custom domain, no environment variables, no production secrets.
- Status: PROJECT CREATED, NOTHING DEPLOYED. The sandbox used for this sprint cannot reach `api.netlify.com` or the Netlify deploy host (HTTP 403 on CONNECT), so the first deploy must be done by the owner or from a machine with Netlify access.
- The staging bundle must differ from the repo in three ways. None of these belong in production, so they are applied to a copy and never committed:
  1. `_headers` containing `X-Robots-Tag: noindex, nofollow, noarchive`.
  2. The live Stripe Payment Link in `guide/index.html` replaced with `#staging-checkout-disabled`.
  3. `netlify/functions/stripe-purchase-hook.js` removed, so nobody can point a Stripe webhook at staging.
  Also remove `content/`, `docs/`, `PROJECT-COMPASS.md`, `email/`, `pmp/`, `workout/` from the copy so private planning files are not served.
- Staging must NOT receive `MAILERLITE_API_KEY`, `STRIPE_*`, or `RESEND_API_KEY`. With no key the handler records the submission and skips MailerLite, so staging cannot email anyone.
- Deployment method for production is API sourced (`deploy_source: api`). A GitHub push does not deploy. Do not assume a push or PR creates a preview.

## 2. Form processing flow (meal-blueprint)
1. `blueprint/index.html` form posts to `/.netlify/functions/blueprint-intake` (not to Netlify Forms directly). The form keeps `data-netlify="true"` and the honeypot so Netlify detects and registers the form at deploy time.
2. `netlify/functions/blueprint-intake.js` validates method, form name, honeypot, first name, email.
3. Duplicate guard: same email and same consent value inside 24 hours is processed once. A person who later ticks consent is processed again.
4. The function re-posts the clean submission to the site root so Netlify Forms records it (fields: first_name, email, marketing_consent yes/no, consent_version, utm_source, utm_medium, utm_campaign).
5. MailerLite: only when `marketing_consent` is exactly `yes`, and only when the API key and the blueprint group ID are set. Upsert call, so repeats are safe.
6. Temporary failures (network, 429, 5xx) are queued in Netlify Blobs and retried every 15 minutes by `blueprint-retry.mjs`, up to 6 attempts. After that the stored email is deleted, a PII-free record is kept, and an error log line `retry_exhausted` is written.
7. The visitor always lands on `/blueprint/thanks/` and can open the resource without agreeing to marketing.
8. Logs contain an 8 character hash, enums, and counts. Never an email or a name. Proven by an automated test.
The existing quiz handler `submission-created.js` was NOT modified. It ignores any form other than `quiz-results`.

## 3. Environment variable names (values never committed)
- `MAILERLITE_API_KEY` (existing)
- `MAILERLITE_BLUEPRINT_GROUP_ID` (new, required for subscribing)
- `URL` (supplied by Netlify at runtime)

## 4. MailerLite design and group status
- No MailerLite access was available in this sprint, so no group was created, read, or used.
- Known groups from repo docs are the quiz group and the buyers group. Neither fits opted-in blueprint subscribers, so a new group is proposed.
- PROPOSED group name, pending owner approval: `No-Math Blueprint (opted in)`.
- Until the owner creates it and sets `MAILERLITE_BLUEPRINT_GROUP_ID`, consenting visitors are recorded in Netlify Forms and flagged `skipped_not_configured`. Nothing is lost, and no one is subscribed.

## 5. Test results
Automated mocked tests: `npm test`, 22 of 22 passing (file `test/blueprint-intake.test.js`). Covers valid, invalid email, missing fields, honeypot, consent yes and no, MailerLite success and failure (500, 429, network, 422), retry and exhaustion, duplicates, missing environment variables, unexpected form names, log privacy. Two deliberate code breaks (loose consent rule, no dedupe) each made a test fail, so the tests do detect regressions.
Local browser run (Chromium, real handler, mocked Netlify Forms and MailerLite): 21 of 21 passing at desktop 1280 wide and mobile 390 wide, zero console errors, no horizontal overflow.
These are code and local results. They are NOT a staging integration test. Netlify Forms registration, the real form submission record, real redirects, and live MailerLite are NOT yet tested.

## 6. Remaining blockers
1. First staging deploy (sandbox network cannot reach Netlify).
2. Owner creates the MailerLite group and approves the name.
3. Owner confirms the privacy and consent wording with a lawyer if desired, and adds a business mailing address to marketing emails.
4. Brand check: the new pages use `#f15002` on `#101010`. Locked brand colors are `#FF5500` and `#080808`. The live site also uses `#f15002`, so decide which wins before launch.

## 7. Rollback
- Code: nothing merged, so nothing to roll back. After a future production deploy, rollback is Netlify "Publish deploy" on deploy 6a7879c481f2f900092251dc.
- Redirects: revert the two redirect edits in `netlify.toml`. Caution: browsers that cached the old permanent 301s to Optins may keep using them, which is why the new rules must be temporary 302s.
- Blueprint funnel: remove the `blueprint/` folder and the two functions. No other system depends on them.

## 8. Proposed production migration (not started)
1. Staging deploy, then repeat the browser tests against the staging URL with synthetic addresses.
2. Create the MailerLite group, set the group ID in staging only with a test group, run one consenting and one non-consenting synthetic submission, confirm one subscriber exists.
3. Export Optins content, consent text, and subscribers before cancelling.
4. Get owner approval, then deploy production from the production branch with these files added.
5. Switch `/free` and `/canvasrebel` to temporary 302s (see `docs/OPTINS-REDIRECT-PROPOSAL.md`), watch for a week, then decide on permanence.
6. Leave `/reset`, `/guide`, `/call`, `/purium` unchanged until their replacements are tested.
