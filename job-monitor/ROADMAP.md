# Career Engine — Roadmap & Status

This is the running plan so we can pick up across sessions without losing the
thread. Philosophy (from you): **the future is in the follow-up.** This isn't
"apply and pray" — it's find → apply fast → follow up relentlessly → build
relationships → learn from every no → until you get the role or the next one.

Last updated: 2026-06-24

---

## Phase 1 — FIND (job alerts)  ✅ built, turning on now
A monitor that watches careers boards and pushes a phone alert for each NEW
job matching your keywords + locations.
- Targets: **ModMed** (Workday board) and **AP Companies** (iSolved).
- Keywords: marketing, communications, content, social media manager, digital
  strategist, brand manager, customer success, demand generation, sales ops,
  revenue ops.
- Locations: Remote, Hybrid, Boca Raton, Delray, Boynton, Lake Worth, Pompano.
- **Cloud runner:** `.github/workflows/job-monitor.yml` runs every 20 min on
  GitHub's servers — no PC setup, no leaving a computer on.
- **You do once:** install the ntfy app + add the `NTFY_TOPIC` GitHub secret
  (steps in the workflow file and the chat).
- Windows desktop version (`run_*.bat` + Task Scheduler) still available as an
  alternative — see README.md.

## Phase 2 — APPLY FAST (assisted 1-click)  ⏳ next
For each alert: open the apply page with your resume + a cover letter tailored
to that exact role already drafted, and safe fields pre-filled — you review and
hit Submit in under a minute.
- **Honest note:** no bot that auto-submits. That breaks Workday/Indeed/
  LinkedIn rules and risks getting *your* accounts banned, and bot apps get
  filtered out. Assisted-but-fast beats fully-automated-but-flagged.

## Phase 3 — APPLICATION KIT  ⏳
Reusable assets so applying + tailoring is quick:
- Master resume + role-specific variants.
- Cover-letter template that adapts per job.
- Saved answers to common application questions (work authorization, salary,
  "why this company," etc.).

## Phase 4 — FOLLOW-UP ENGINE  ⭐ the heart of it  ⏳
A tracker + cadence + message templates so no opportunity goes cold:
- **Application tracker** (every job: status, contacts, next-follow-up date).
- **Post-apply follow-up** note to the recruiter/hiring manager.
- **Coffee / informational chat** request — learn the field, give value, talk
  about what *they* care about.
- **Post-rejection feedback** ask — "what can I improve so I'm the pick next
  time?" — and log it for next time.
- **LinkedIn nurture** — connect + stay on their radar with value.
- **Cadence:** follow up on a schedule until you get it, or pivot the
  relationship toward the next opening.
- **Honest note:** automated LinkedIn actions / mass emails violate those
  platforms' rules. Instead this builds *drafts*, *reminders*, and a *tracker*
  (can plug into your Gmail drafts + Google Calendar) — you click send, so the
  relationships stay genuinely yours.

---

## Open decisions / needs from you
- [ ] Add the `NTFY_TOPIC` GitHub secret (Phase 1 go-live).
- [ ] Confirm cloud runner vs. Windows desktop (default: cloud).
- [ ] Phase 2+: provide your current resume so I can build the kit.
- [ ] Whether to wire Gmail drafts + Google Calendar into the follow-up engine.
