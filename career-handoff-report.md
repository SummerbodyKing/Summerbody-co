# Career Engine — Honest Handoff Report
_For the planning chat. Written 2026-06-29 by the build agent (Claude Code, in the GitHub/Netlify environment)._

## TL;DR
We built a job-**finding** + notification system (cloud monitor + live dashboard).
We have NOT helped Terrence **apply** to a single job. Finding was never the
bottleneck — he already had 8 target job URLs weeks ago. The bottleneck is
**applying** (needs a resume + tailored materials + the human act of submitting)
and **following up**. We aimed at the wrong target. Re-aim now.

---

## What the build agent CAN do (and how)
1. **Build & run software/automation, free, 24/7.** Web pages, dashboards,
   scripts; scheduled on GitHub Actions. _How: writes code, commits to the repo,
   schedules it._ (Already live: a monitor that checks ModMed every ~20 min and a
   dashboard at `/job-dashboard.html`.)
2. **Read public job boards.** Workday / Greenhouse / Lever / RSS via their data
   feeds; simple HTML scraping. _Proven: pulled 40 ModMed jobs, matched 2._
3. **Draft tailored documents fast.** Resumes, cover letters, application Q&A,
   outreach emails, **content calendars**, post copy. _How: give it background +
   the target; it writes._
4. **Design visuals — Canva is connected (MCP).** Social posts, carousels,
   graphics for a content calendar. _How: create/edit Canva designs directly._
5. **Email + calendar — Gmail & Google Calendar connected (MCP).** Draft
   follow-up emails, schedule post/follow-up reminders, create coffee-chat
   events. _How: it drafts; Terrence approves/sends._
6. **Store & organize — Google Drive connected; Asana/ClickUp connected.**
   Save materials, track applications and follow-ups.

## What it CANNOT do (hard limits — plan around these)
- **Cannot auto-submit job applications** (Workday/Indeed/etc. forbid bots; need
  logins/CAPTCHA; risks getting Terrence's accounts banned). It can prep
  everything; **a human clicks submit.**
- **Cannot act as Terrence on LinkedIn** (auto-connect/DM violates LinkedIn ToS).
  It drafts; he sends.
- **Cannot use accounts/passwords/2FA it doesn't have**, and cannot write a
  resume without his **actual work history** — which it has never been given.
- **Cannot do the last-mile human steps.** Anything that needs his phone or his
  click stalls until he does it. (This is exactly where we keep getting stuck.)

---

## THE GAPS (why zero applications after weeks)
- **Gap 1 — No resume on file.** We never collected Terrence's resume/work
  history. You cannot apply without it. This is the #1 blocker.
- **Gap 2 — The system notifies, it doesn't apply.** "Apply" was treated like it
  would happen automatically. It won't — it's a human action we never set up
  support for (no tailored resume/cover-letter flow).
- **Gap 3 — Last-mile setup friction.** Phone alerts depend on installing the
  ntfy app + subscribing to a topic + (optionally) a GitHub secret. These steps
  were never confirmed done, so in practice the system has delivered him nothing.
- **Gap 4 — We never sat down and submitted ONE application together.**

---

## WORK BACKWARDS (from the goal to the next brick)
Got hired ← nailed the interview ← got the interview ← submitted a strong,
**tailored** application ← had a **resume + cover letter** ready ← chose a target
job (**already have these!**) ← **[STUCK HERE: no resume gathered, none ever
submitted].**
**Next brick = get the resume, tailor it to ONE job, submit it this week.**

## PRE-MORTEM (it's 30 days out and still 0 applications — why?)
- We kept polishing tools instead of submitting.
- Setup stalled on phone/secret steps.
- No resume was ever gathered, so nothing could be tailored.
- "Apply" was assumed automatic; it's manual.
**Prevention:** gather resume NOW; apply to ONE job this week with drafted
materials; treat the monitor/dashboard as a bonus, not the main event.

## STEELMAN (what we built is still worth keeping)
- The monitor genuinely finds matching roles 24/7, free and within the rules; it
  already surfaced 2 Customer Success roles he might have missed.
- The dashboard is one place to see matches.
- Once he's applying regularly, these cut the "finding" busywork so energy goes
  to applying + following up. **Demote it from "the thing" to "a helper."**

## RED TEAM (attack the current approach)
- Optimized **finding**, which was never the bottleneck — he had 8 URLs weeks ago.
- Produces **alerts, not applications** — can't move the real goal alone.
- Depends on **his manual setup**, which keeps not completing → delivers nothing.
- Added complexity and frustration with **zero applications sent.**
**Verdict:** real build, mis-aimed. Re-aim at resume → apply → follow up.

## ELI5
We built a doorbell that rings when a new job appears. 🛎️ But nobody walked
through the door to fill out the application — and the doorbell isn't even wired
to his phone yet. What he needs first isn't a better doorbell; it's a **resume**
and **30 minutes to send ONE application.** The doorbell can keep ringing in the
background.

---

## THE CONTENT CALENDAR — how we actually complete it
The build agent can produce the whole thing end to end:
1. **Draft the calendar** — themes, weekly cadence, hooks, post copy.
2. **Design the visuals in Canva** (connected) — templated posts/carousels.
3. **Schedule it** in Google Calendar (connected) with posting + follow-up
   reminders.
4. **Store it** in Google Drive (connected); track in Asana/ClickUp.
**What it needs from the planning chat to start:**
- **Purpose:** is the calendar for (a) Terrence's **job-search personal brand /
  LinkedIn** (to give value + stay on recruiters' radar), or (b) the
  **Summerbody business**? (Changes everything.)
- **Voice/themes**, **platforms** (LinkedIn? IG?), **cadence** (posts/week),
  and any **offers/links** to feature.

## THE SINGLE NEXT ACTION (unblocks everything)
Get Terrence's **resume** (paste it, upload it, or he tells his work history and
the agent drafts one) → pick **ONE** job (a live ModMed CS role, or the one he
wants most) → agent produces a **tailored resume + cover letter** he can submit
**today.** First application out the door = momentum.
