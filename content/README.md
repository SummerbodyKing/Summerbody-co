# Content System — Sweat Department

This folder is the source of truth for every scheduled email going to the warm list.

## Folder Map

```
content/
├── README.md              ← you are here
├── email-calendar.md      ← master schedule (8 weeks visible)
└── emails/
    ├── E03-2026-06-17.md
    ├── E04-2026-06-24.md
    ├── E05-2026-07-01.md
    ├── E06-2026-07-08.md
    └── (E07 onward — written week of Jul 8)
```

## Weekly Workflow (15 min, every Sunday night)

1. Open the .md file for next Tuesday's send (e.g., `emails/E04-2026-06-24.md`).
2. Read the body once. Edit anything that doesn't feel like your voice this week.
3. Open MailerLite → Campaigns → Create new campaign.
4. Follow the **MailerLite Build Recipe** in `email-calendar.md`.
5. Schedule for Tuesday 9am ET.
6. Done. Don't think about email again until next Sunday.

## Phase 2 — Automation (this week)

We're building a GitHub Actions cron job that will:
1. Run every Tuesday at 9am ET
2. Read the .md file matching today's date
3. Convert markdown → MailerLite-compatible HTML
4. Call MailerLite API to create + send the campaign
5. Update the file's `status:` field from `DRAFT` to `SENT`

Until that ships, do the manual workflow above. After it ships, you only need to write/edit content. The system handles the rest.

## Email Format Constraints (MailerLite Free Plan)

MailerLite free plan does NOT allow custom HTML paste. You must use their drag-and-drop editor. This means:

- **WORKS:** GIFs uploaded as image blocks, button blocks with custom colors, text blocks with formatting, headings, columns
- **DOESN'T WORK:** Pixel-perfect custom layouts from a hand-coded HTML file

For each email, the `## DESIGN NOTES FOR MAILERLITE` section at the bottom of the .md tells you the block-by-block recipe.

If/when we hit revenue and want pixel-perfect emails, two upgrade paths:
- **MailerLite Advanced** ($18/mo) — unlocks custom HTML editor
- **Resend Broadcasts** (free up to 3,000/mo) — supports custom HTML natively, requires list migration

## Voice Standards (apply to every email)

- Casual emoji, sparingly. Earned humor breaks only.
- Hyper-specific vulnerability (real numbers, real names, real details).
- "1/2 the man I used to be" or "Welcome to team SUMMERBODY" as identity anchors.
- Sign-off: KING SUMMERBODY, Founder, The Sweat Department LLC, 500 S Federal Hwy #311 Hallandale Beach FL 33008.
- Two P.S.es: one with a soft sell (site/guide/Calendly), one about spam folder.
- "Hit reply" CTAs outperform direct sells on this list (proven by Email 1 vs Email 2 data).

## Performance Benchmarks (your actual data)

| Email | Date | Recipients | Open % | Click % | CTOR |
|---|---|---|---|---|---|
| E1 — "I went quiet" | May 1, 2026 | 229 | 33.62% | 9.61% | 28.57% |
| E2 — "Break The Cycle" | May 8, 2026 | 188 | 37.77% | 4.79% | 12.68% |

Beat 33% open and 5% click on every send. Track in `email-calendar.md` as we ship.
