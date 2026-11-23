# Sprint 2: Staging, Consent-Aware Lead Capture, and Test Evidence
Date: 2026-11-01
Branch: audit/sweatdept-revenue-safety-2026-11-01 (draft PR #17, unmerged)
Production: untouched. Live deploy 6a7879c481f2f900092251dc, branch claude/setup-quiz-email-mbZOq, commit 3b242fa.

## 1. Staging architecture (reproducible from GitHub)
- Separate Netlify project: `sweatdept-staging-blueprint` (site id daaefbb5-f276-4bef-9ed7-da496d50151b), same team, no custom domain, no environment variables.
- Status: project exists, linked to nothing, nothing deployed. The sandbox used to build this cannot reach Netlify, so linking and the first deploy happen in the owner's Netlify account.
- Everything staging-specific lives in `scripts/build-staging.js` and `scripts/verify-staging.js`, committed on this branch. Nothing about staging is applied by hand.

### Exact Netlify settings for the staging project
| Setting | Value |
|---|---|
| Repository | SummerbodyKing/Summerbody-co |
| Branch | audit/sweatdept-revenue-safety-2026-11-01 |
| Build command | `npm run build:staging` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` (set by netlify.toml, which wins over any dashboard value) |
| Environment variables | none. Do not add any. |

### What `npm run build:staging` does
1. Aborts if it is running on any Netlify site other than the staging site id (so it cannot be pasted onto the production project by mistake).
2. Aborts if any of these are in the build environment: `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`, `MAILERLITE_BLUEPRINT_GROUP_ID`, `MAILERLITE_BUYERS_GROUP_ID`, `RESEND_API_KEY`, or any variable starting `STRIPE_`. It prints only names, never values. This also catches team-level shared variables that would otherwise be inherited.
3. Builds `dist/` from `blueprint/`, `guide/index.html`, `index.html`, `photos/`. The paid PDF (`guide/break-the-cycle.pdf`) and the post-purchase page (`guide/thanks/`) are not copied.
4. Replaces every live Stripe Payment Link in the guide page with `#staging-checkout-disabled` and aborts if any Stripe URL or key remains.
5. Writes `dist/_headers` (noindex, nofollow, noarchive, no-referrer) and `dist/robots.txt` (disallow all).
6. Removes `netlify/functions/stripe-purchase-hook.js` from the build container (not from GitHub) and writes `netlify/functions/staging-config.json`. That file switches MailerLite off inside `blueprint-intake.js`, so even if credentials reach the runtime some other way, staging never contacts MailerLite.
7. Runs `scripts/verify-staging.js`, which re-checks the output and bundles both functions with esbuild to confirm `@netlify/blobs` is included. Any failure fails the build.
Run it locally with `npm install && npm run build:staging`. Locally it does not modify tracked files: functions go to `.staging-functions/`.
- Not verified: how Netlify's own function bundler behaves. The esbuild check proves the code and `@netlify/blobs` bundle, not the Netlify runtime.
- Deployment method for production is API sourced (`deploy_source: api`). A GitHub push does not deploy production.

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
Automated tests: `npm test`, 32 of 32 passing (`test/blueprint-intake.test.js` and `test/staging-build.test.js`). Staging build verifier: `npm run build:staging`, 25 of 25 checks. Covers valid, invalid email, missing fields, honeypot, consent yes and no, MailerLite success and failure (500, 429, network, 422), retry and exhaustion, duplicates, missing environment variables, unexpected form names, log privacy. Two deliberate code breaks (loose consent rule, no dedupe) each made a test fail, so the tests do detect regressions.
Local browser run (Chromium, real handler, mocked Netlify Forms and MailerLite): 21 of 21 passing at desktop 1280 wide and mobile 390 wide, zero console errors, no horizontal overflow.
These are code and local results. They are NOT a staging integration test. Netlify Forms registration, the real form submission record, real redirects, and live MailerLite are NOT yet tested.

## 6. Remaining blockers
1. First staging deploy: link the staging project to this branch (settings in section 1).
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
