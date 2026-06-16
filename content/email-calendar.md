# Email Calendar — Sweat Department

Author: KING SUMMERBODY
Last updated: 2026-06-16
Cadence: Tuesdays at 9am ET (one per week)
Audience: MailerLite warm list (~188 subs as of June 2026)

## How this works

1. Each `.md` file in `emails/` is one scheduled email.
2. Front matter at the top has the metadata (subject, send date, etc.).
3. Body is the email copy ready to drop into MailerLite.
4. Each Sunday, open the next week's file, refine if needed, paste into MailerLite, schedule for Tuesday 9am ET.
5. Phase 2 (this week): GitHub Actions cron job will auto-send via MailerLite API. Until then, manual paste-and-schedule.

## Schedule

| # | Send Date | File | Subject | Theme | Status |
|---|---|---|---|---|---|
| E3 | Tue Jun 17, 2026 | `E03-2026-06-17.md` | I broke my promise. Here's the truth. | Mother's Day grief + system promise | DRAFT |
| E4 | Tue Jun 24, 2026 | `E04-2026-06-24.md` | The cheapest fat-loss tool nobody uses correctly | Pillar 1 — Water Protocol | DRAFT |
| E5 | Tue Jul 1, 2026 | `E05-2026-07-01.md` | Half the year is gone. What did you do with it? | July mid-year reset | DRAFT |
| E6 | Tue Jul 8, 2026 | `E06-2026-07-08.md` | The part of my story I haven't told publicly | Vulnerability + soft sell | DRAFT |
| E7 | Tue Jul 15, 2026 | (Phase 2) | Direct $2.97 ebook push | Conversion | TODO |
| E8 | Tue Jul 22, 2026 | (Phase 2) | Discovery Call push (Calendly) | High-tier conversion | TODO |
| E9 | Tue Jul 29, 2026 | (Phase 2) | Month-in-review + receipts | Maintain rhythm | TODO |
| E10 | Tue Aug 5, 2026 | (Phase 2) | Big offer or season pivot | Reset cycle | TODO |

## MailerLite Build Recipe (until automation ships)

For each email, in MailerLite Editor:

1. **Header block** — text only, single line: "SWEAT DEPARTMENT  ·  BETTER & BEYOND" in your brand orange `#F15002`.
2. **Greeting + opening paragraphs** — paste from the `## BODY` section of the .md file. Use H2 / paragraph blocks.
3. **GIF / Image block** — for E3, upload `before-after.gif` from the repo (`/photos/before-after.gif`). For other emails, use the suggested image in the .md's `## VISUAL` section or skip.
4. **CTA Button** — use the primary CTA from `## CTA`, button color `#F15002`, text white, all caps.
5. **Secondary text link** — paste from `## SECONDARY` if present.
6. **Sign-off** — paste from `## SIGN_OFF`. Bold the name.
7. **Footer** — MailerLite handles your address + unsubscribe automatically. Keep their default footer.

## Voice patterns to preserve every time

- Casual emoji + humor breaks ("🤷🏾 HAHA!") — sparingly
- Hyper-specific vulnerability (real numbers, real names, real details)
- "Welcome to team SUMMERBODY"
- "1/2 the man I used to be"
- Sign-off: "KING SUMMERBODY, Founder, The Sweat Department LLC"
- Two P.S.es: site link + spam folder
- "Hit reply" CTAs outperform direct sells on this list (proven by Email 1 vs Email 2 data: 28.57% CTOR vs 12.68%)
