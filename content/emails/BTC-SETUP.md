---
title: Break The Cycle Buyer Funnel — Setup Guide
last_updated: 2026-08-03
owner: KING SUMMERBODY
status: READY — final setup steps are King's manual clicks in Stripe, MailerLite, Netlify
---

# Break The Cycle Buyer Funnel — Setup Guide

Everything that's already built in code is committed. This document lists the manual clicks you (King) need to do in Stripe, MailerLite, and Netlify to turn it on.

**Nothing on production changes until you complete Section 2 and Section 3.** Deploy previews will already show the thanks-page fix.

---

## 1. What's built (already in this repo)

- `guide/thanks/index.html` — thanks page now has Discovery Call (primary) + Skool (secondary) + Instagram (tertiary) instead of a dead "back to home" button
- `netlify/functions/stripe-purchase-hook.js` — receives Stripe webhook, verifies signature, extracts buyer email + name, pushes to a NEW MailerLite BUYERS group
- `package.json` — `stripe` SDK added as a dependency
- `content/emails/BTC01`–`BTC05` — 5-email buyer sequence, ready to paste into MailerLite automation
- Discovery call is the primary conversion goal. Purium is the last email (day 14) not the first.

---

## 2. MailerLite — create the BUYERS group (2 min)

1. Log into MailerLite
2. **Subscribers → Groups → Create new group**
3. Name it: `BTC Buyers` (or whatever — the ID is what matters, not the name)
4. Save. On the group's page, look at the URL. It looks like `.../subscribers/groups/12345678/subscribers`. That number is the `GROUP_ID`.
5. Copy that ID. You'll paste it into Netlify in Section 4.

**While you're in MailerLite, build the automation:**

1. **Automations → Create automation → Trigger: When subscriber joins a group → BTC Buyers**
2. Add 5 email steps:
   - Step 1: paste from `BTC01-day0-welcome.md` (send immediately)
   - Step 2: delay 2 days → paste from `BTC02-day2-nextrightchoice.md`
   - Step 3: delay 3 days (total = day 5) → paste from `BTC03-day5-discoverycall.md`
   - Step 4: delay 5 days (total = day 10) → paste from `BTC04-day10-proof.md`
   - Step 5: delay 4 days (total = day 14) → paste from `BTC05-day14-purium.md`
3. Activate the automation.

---

## 3. Stripe — add the webhook (2 min)

1. Log into `dashboard.stripe.com`
2. **Developers → Webhooks → + Add endpoint**
3. Endpoint URL: `https://sweatdepartment.com/.netlify/functions/stripe-purchase-hook`
4. Description: `Break The Cycle purchase → MailerLite BUYERS group`
5. **Events to send:** search for and select ONLY `checkout.session.completed`
6. Save the endpoint. Stripe will show you the **Signing secret** (starts with `whsec_`). Copy it. You'll paste it into Netlify in Section 4.

---

## 4. Netlify — add 3 environment variables (2 min)

Go to Netlify → `sweatdepartment` project → **Site configuration → Environment variables → Add a variable** — do this for EACH of the following (scope = All contexts):

| Key | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | The `whsec_...` string from Section 3 step 6 |
| `STRIPE_SECRET_KEY` | Your Stripe LIVE secret key from Dashboard → Developers → API keys (starts with `sk_live_`) |
| `MAILERLITE_BUYERS_GROUP_ID` | The group ID from Section 2 step 4 |

Then **trigger a redeploy** (Deploys tab → "Trigger deploy → Deploy site") so the function picks up the new env vars.

---

## 5. Test the full loop (5 min)

1. Open `https://sweatdepartment.com/guide` in an incognito window
2. Click the buy button → complete the Stripe checkout with a real card (you can refund yourself)
3. Confirm you land on the thanks page and can download the PDF
4. Within 30 seconds, check MailerLite → BTC Buyers group. **Your email should appear there.**
5. Within a few minutes, your inbox should get `BTC01-day0-welcome`
6. If the webhook fired but MailerLite didn't get the subscriber, go to Netlify → Functions → `stripe-purchase-hook` → view logs. The function logs everything with `stripe_hook_env_check`, `stripe_event_received`, `stripe_purchase_processed`.

---

## 6. Things this build DOES NOT do (yet)

- **PDF is not password-gated.** Anyone with `sweatdepartment.com/guide/break-the-cycle.pdf` can grab it. Acceptable for $2.97. Upgrade later if it becomes a leak.
- **Buyer sequence is a one-shot.** After BTC05, the buyer just stays on your main list. No re-engagement branch. Add if/when volume justifies.
- **No refund handling.** If someone refunds through Stripe, they stay in the MailerLite group. Add a `charge.refunded` handler later if you start seeing refunds.
- **No abandoned cart.** Stripe checkout doesn't email people who bail. If you want that, we build a `checkout.session.expired` handler.

---

## 7. Voice guardrails on the emails

Every BTC email preserves the voice patterns from `content/email-calendar.md`:

- "1/2 the man I used to be"
- "Welcome to team SUMMERBODY"
- "Together WE Achieve More. No man gets left behind."
- Two P.S.es (P.S. + P.P.S.)
- HIT REPLY as the true primary CTA even when an orange button is present
- Real numbers, real specifics, no generic wellness copy

**Do not modify these emails without preserving those patterns.** If you want to rewrite one, keep the sign-off + P.S.es intact.
