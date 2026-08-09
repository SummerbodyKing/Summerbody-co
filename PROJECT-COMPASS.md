# PROJECT COMPASS

**Owner:** KING SUMMERBODY (Terrence Michael Scott)
**Business:** Sweat Department LLC / SUMMERBODY & Co.
**Domain:** sweatdepartment.com (Netlify, site_id `e55293e7-3f7a-4a80-bc04-a3a7d5be8356`)
**Production branch:** `claude/setup-quiz-email-mbZOq` (NOT `main`. `main` is stale.)
**Repo:** `SummerbodyKing/Summerbody-co` (PR #1)
**Last updated:** 2026-08-09

---

## READ THIS FIRST (for any Claude chat opening this repo)

You are looking at KING SUMMERBODY's business. Before you touch anything:

1. Production branch is `claude/setup-quiz-email-mbZOq`, NOT `main`. `main` is a stale career-monitor project and should be ignored.
2. King's voice rules: NO em-dashes ever. KING and SUMMERBODY always caps when together. Sign-off is "1/2 the man I used to be." Two P.S.es always. See "VOICE" section below.
3. Brand color: `#F15002` (matches live site). If `CLAUDE.md` says otherwise, live site wins.
4. Before proposing new work, read the "LIVE / HALF-BUILT / BROKEN" section so you don't duplicate or break existing systems.
5. Before creating new files, check if similar files exist. King has content already scattered across `content/emails/`, `content/pmp/`, `content/social/`, `guide/`, `email/`, `pmp/`, `workout/`.

---

## THE BUSINESS IN ONE PARAGRAPH

King lost 180 pounds naturally, no gym, no Ozempic, no surgery, going from 400 lbs to 220. He now runs Sweat Department LLC teaching the mental-model version of transformation. Core methodology is "Make The Next Right Choice" plus a 5-Pillar system (water, movement, sleep, food, mindset). Target audience is men, especially Black men, stuck in the all-or-nothing weight-loss cycle. Business also targets executives and high-performers via the "leadership framing" of the same rule.

## PRODUCT LADDER (cheapest to most expensive)

| Tier | Product | Price | Purpose |
|---|---|---|---|
| 0 | The 5-Pillar Quiz | Free | Lead capture, quiz answers → MailerLite quiz group + Resend personalized email |
| 0 | Free Skool community | Free | Warm community, low-friction next step for prospects and buyers |
| 1 | Break The Cycle Guide (`/guide`) | $2.97 | Impulse buy, PDF via Stripe, thanks page pushes discovery call |
| 2 | Free 15-min Discovery Call | Free | Qualification for coaching, primary conversion goal for BTC buyers |
| 3 | 1-on-1 Coaching / Programs | (King fills in) | Highest ARPU |
| Lateral | Purium gift card | $50 off first order | Nutrition affiliate, King is a Purium rep |

## THE FUNNEL (traffic → sale, end to end)

1. **Traffic in:** IG (@sweatdepartment), TikTok, direct/word-of-mouth, guest features (CanvasRebel, targeting Authority Magazine), email list
2. **Landing options:**
   - `sweatdepartment.com` — full homepage with quiz + guide
   - `sweatdepartment.com/guide` — $2.97 direct offer
   - `sweatdepartment.com/free` — lead-magnet meal blueprint optin
   - `sweatdepartment.com/reset` — 5-day holiday reset optin
   - `sweatdepartment.com/canvasrebel` — same meal blueprint, tracked
3. **Free path:** Quiz → email delivery (Resend) → adds to MailerLite quiz group → Tuesday broadcast newsletter cadence
4. **Paid path:** `/guide` → Stripe checkout $2.97 → thanks page → PDF download + Discovery Call CTA + Skool CTA
5. **Post-purchase:** Stripe webhook (`stripe-purchase-hook.js`) → adds buyer to MailerLite BUYERS group (194751098908575220) → triggers 5-email BTC automation (Day 0, 2, 5, 10, 14)
6. **Highest-value conversion:** Discovery Call on Calendly → 1-on-1 program

## LIVE / HALF-BUILT / BROKEN (state as of 2026-08-09)

**LIVE and working:**
- Homepage (`index.html`) with quiz, offer sections, buttons to `/guide`
- `/guide` Break The Cycle sales page with real Stripe checkout at $2.97
- `/guide/thanks/` page with PDF download button + Discovery Call CTA + Skool CTA + IG
- PDF at `/guide/break-the-cycle.pdf` (37 pages, 3.6MB)
- Netlify Functions: `submission-created.js` (quiz email pipeline) + `stripe-purchase-hook.js` (buyer webhook)
- Short URLs (netlify.toml): `/call`, `/canvasrebel`, `/free`, `/reset`, `/purium`, `/card`
- MailerLite quiz group (185865238285911627) auto-populated from quiz submissions
- MailerLite BUYERS group (194751098908575220) auto-populated from Stripe purchases (env vars set 2026-08-09)

**HALF-BUILT (waiting on King):**
- BTC 5-email automation in MailerLite. Function pushes buyers into the group correctly. Automation is not yet built in MailerLite. Setup guide: `content/emails/BTC-SETUP.md`. Even simpler walkthrough: `content/social/MAILERLITE-AUTOMATION-ELI5.md`.
- `EBOOK_URL` env var still points to dead Shopify URL. Should update to `https://sweatdepartment.com/guide` next time we touch the quiz-email pipeline.
- `PROJECT-COMPASS.md` (this file). Update as things change.

**BROKEN / GONE:**
- Shopify store (retired). Any `/products/*`, `/cart`, `/checkout`, `/collections/*` redirects in netlify.toml go to dead subdomain. Not blocking anything active.

## VOICE — the non-negotiables

- **NO em-dashes.** Ever. Use periods, colons, hyphens with spaces, or restructure.
- KING and SUMMERBODY always caps when they appear together
- "1/2 the man I used to be" always in the sign-off
- "Welcome to team SUMMERBODY" is a recurring closer
- "Together WE Achieve More. No man gets left behind."
- "Better & Beyond." is the mantra
- Two P.S.es on emails (P.S. + P.P.S.)
- Real specifics always beat abstractions (real names, real numbers, real dates, real places)
- Vulnerability without pity. Standing without preaching.
- "Make the next right choice" is THE rule
- Never sell weight-loss surgery or Ozempic. Ever.
- Reader address: "Hey [First Name]," or "friend" as fallback
- CTA hierarchy: HIT REPLY primary on email, Book Discovery Call primary on web
- Brand: `#F15002` orange, `#000000` black, `#FFFFFF` white, `#F5F5F5` smoke, `#F0EFED` cream. Anton headings, Montserrat body.

## KEY NUMBERS (King, update these — they are the honest scorecard)

_As of last known snapshot. King: overwrite each field the moment you have a fresh number._

| Metric | Value | As of | Source |
|---|---|---|---|
| Personal weight lost | 180 lbs (400 → 220) | Verified | King's story |
| Timeframe of transformation | UNKNOWN — King fill in | | |
| MailerLite total subs | ~232 | 2026-06 | E03 send data |
| Skool community members | UNKNOWN | | Skool dashboard |
| Skool 90-day retention % | UNKNOWN | | Skool dashboard |
| Discovery calls last 30 days | UNKNOWN | | Calendly |
| BTC guide sales all-time | UNKNOWN | | Stripe |
| Signature client transformation (permission granted) | UNKNOWN | | King |
| IG @sweatdepartment followers | UNKNOWN | | IG |
| TikTok followers | UNKNOWN | | TikTok |

## ASSETS DIRECTORY (where things live)

**Owned properties:**
- Website: sweatdepartment.com
- IG: @sweatdepartment
- IG (personal): @kingsummerbody
- Skool: https://www.skool.com/team-summerbody-1207 (free)
- Calendly (business discovery calls): https://calendly.com/contact-sweatdepartment/discovery-call
- Calendly (personal, job hunting): https://calendly.com/terrencescott/30min — do not put on marketing surfaces
- Email address: contact@sweatdepartment.com

**Third-party stacks:**
- Stripe: Break The Cycle product active at $2.97, webhook wired
- MailerLite: quiz group + BUYERS group active
- Resend: transactional email (personalized quiz results)
- Purium (affiliate): https://ishoppurium.com/homepage?giftcard=summerbody
- CanvasRebel: featured 2026-05-26

**Repo assets:**
- Photos: `/photos/` (transformation shots, before-after gif, hero images)
- Email drafts: `/content/emails/` (E03 sent, E04-E06 drafts, BTC01-05 automation-ready)
- Social content: `/content/social/` (see README there)
- Guide PDF: `/guide/break-the-cycle.pdf`
- Workout coach: `/workout/park.html`
- PMP study page: `/pmp/review.html`

## OPEN QUESTIONS King should answer soon

1. What's the paid coaching program name and pricing? (Add to product ladder)
2. What percentage of the Skool community is active 90 days in?
3. Do you have 1 signature client transformation with permission to quote?
4. Timeframe to go 400 → 220? Needed for pitch copy.
5. IG + TikTok follower counts today? Baseline metric.
6. Are you running paid ads anywhere?
7. Any active partnerships (podcasts, guest speaking, brand collabs)?

## CURRENT ACTIVE WORK

**Now (2026-08-09):**
- Content batch 01 for social launch (see `/content/social/`)
- Waiting on King to build MailerLite 5-email automation from `BTC-SETUP.md` steps 2

**Next:**
- Content batch 02 (based on King's feedback + open-question answers)
- Update `EBOOK_URL` env var to `/guide`
- Merge branch to `main` OR confirm branch stays production (per handoff, current branch IS production)

## PROJECT LEAD PROTOCOL

The Claude that reads this doc IS the project lead until King says otherwise. That means:
1. Read this compass. Do not skip it.
2. Before writing new content, check `content/social/QUALITY-CHECKLIST.md` — every piece must clear that bar.
3. Update this compass at the end of every session that changes state (new env var, new file, new metric, new decision).
4. If King asks for something already partly-built, extend the existing thing. Do not start over.
5. Every session must end with either (a) commit + push OR (b) a message telling King exactly what is uncommitted and why.
