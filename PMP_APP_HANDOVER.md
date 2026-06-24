# PMP Command Center — Engineering Handover & Audit Brief

**Audience:** A Claude Code (or other engineering) agent picking this up fresh.
**Goal of this document:** Give you everything needed to audit the existing PMP study app, find gaps, and rebuild it into a **self-driving, 8+ hour/day intensive learning system** that takes a learner from baseline to exam-ready in a fixed sprint — with content sourced from PMI (ECO + PMBOK 7) and verified online sources, and with real progress/readiness tracking.

> **Prime directive:** The learner must be able to open the app each day and have it tell them *exactly* what to do, minute by minute, for a full study day — deliver the learning, check it off, test them, track whether they're on schedule, and report whether they are on pace to pass. No guessing, no dead ends, content that changes day to day, always measured against the real exam bar.

---

## 1. Product context

- **What it is:** A single-page PMP (Project Management Professional) exam-prep web app for one primary learner doing a **14-day intensive sprint** toward a scheduled exam date.
- **Current exam date in code:** `EXAM_DATE = 2026-07-08` (see `pmp.html`). Day numbering is derived from a sprint start; `getCurrentDay()` returns 1–14.
- **Learner profile:** Highly motivated but non-technical. Needs to be *led*, not handed options. Gets overwhelmed by walls of text and by having to make decisions. Wants the app to be the coach: fill the day with the right work, enforce the schedule, and tell them where they stand.
- **Tone/standards the learner expects:** "Lead PM" rigor — anticipate what they don't know to ask; always orient them; always compare their numbers to what the exam requires.

### The real PMP exam (target spec — everything must map back to this)
- **180 questions, 230 minutes**, two optional 10-minute breaks (after Q60 and Q120).
- **Three domains, weighted:** **People 42% · Process 50% · Business Environment 8%.**
- **~50% predictive, ~50% agile/hybrid** content.
- Based on the **PMI Exam Content Outline (ECO)** — 3 domains broken into **35 tasks**.
- **PMBOK Guide 7th edition** underpins it: **12 Principles**, **8 Performance Domains**, plus models/methods/artifacts.
- Target pace: ~**77 seconds/question**. Passing is roughly "Above Target" across domains (PMI does not publish a numeric %; the app uses 70%+ as a working proxy on quizzes).

---

## 2. Technical architecture (how the app is built)

**This is intentionally a low-dependency, single-file static app. Keep it that way unless there's a strong reason not to.**

| Layer | Detail |
|---|---|
| **Main app** | `pmp.html` — one self-contained file (~4,000+ lines): HTML + CSS in `<style>` + vanilla JS in `<script>`. No build step, no framework, no bundler. |
| **Entry/redirects** | `index.html`, `_redirects`, `netlify.toml`. The app is served at `/pmp`. |
| **State** | `localStorage` key `pmp_state_v2`. The `state` object holds answers, wrongLog, studyLog, domainStats, xp, badges, streak, path (14-day step completion), runsheet (Today blocks), drillStats, notes, questionNotes, brushUp, qTimes, aiQuestions. `loadState()` / `saveState()` / `stateSnapshot()`. |
| **Cloud sync** | Supabase (`SB_URL` fyhxtghbuayikllxmzyi). Optional account → cross-device sync of the same snapshot into a `progress` table. `initCloud()`, `cloudPush()`, `cloudPull()`. |
| **AI Coach** | `netlify/functions/ai-coach.js` — serverless function calling the Anthropic Messages API to generate fresh exam-style questions. Requires env var `ANTHROPIC_API_KEY` (already set on the Netlify site as a secret). Model defaults to `claude-sonnet-4-6`. Front-end entry: `aiGenerate()` in `pmp.html`. |
| **Hosting/CI** | Netlify. Production site `summerbodyco` → `terrencemichaelscott.me`. Every push to the feature branch builds a Deploy Preview; work is reviewed via PR before merge to `main`/production. |

### Key data structures & functions to know (in `pmp.html`)
- `QUESTIONS` — array of ~88 question objects: `{id, domain, difficulty, principle, text, options[4], answer (0-based), explanation}`.
- `DAYS` — the 14-day schedule (date, topic, phase).
- `DAY_PLAN` — per day: `{lessons:[ls-*], drill, video, boss}` (boss is an array of question ids, or `'mock'` / `'weak'`).
- `FLASHCARDS` — principle/term/formula cards.
- `EXERCISES` + `injectLessonQuizzes()` — interactive learn-by-doing drills and the per-lesson "Check yourself" quizzes.
- `DRILL_GENS` + `newDrill()`/`renderFormulaDrill()` — the randomized Formula Drill (fresh numbers every time).
- `buildRunSheet(d)` / `renderToday()` — the **Today** hour-by-hour run sheet (the spine of the daily experience).
- `renderReadiness()` — exam-weighted readiness gauge + pace tracking.
- `lessonFor(text)` — maps a question's topic to a lesson id (used to route questions ↔ lessons).
- Navigation: `showPage(id)` with pages: `today, dashboard (War Room), path, learn, study (Practice), flashcards, formulas, videos, wronglog, studylog (Journal)`.

### How to run / verify
- It's static: open `pmp.html` in a browser, or use the Netlify Deploy Preview.
- **Always** parse-check JS after edits (extract `<script>` blocks, `new Function(src)`), and fuzz any generator you add (assert exactly one correct answer + N unique choices).
- Respect the existing CSS variables and visual language (dark, orange `--orange` accent). Match surrounding code style.

---

## 3. Current feature inventory (what already exists)

1. **▶ Today (run sheet)** — auto-builds a timeboxed day from `DAY_PLAN` into ordered blocks (warm-up → watch → see → drill → breaks → flashcards → formula lab → boss → fix → journal). A "do this now" pointer, a progress ring, blocks that launch the real activity and self-check. Mock/weak/taper days generate tailored sheets.
2. **14-Day Path** — gamified level map; each day = 4 steps (Watch/See/Drill/Boss), 70%+ boss clears the day.
3. **Learn** — ~15 visual lessons (`ls-*`), several interactive (drag/click) exercises, and a per-lesson **Check yourself** quiz pulling mapped questions (randomized).
4. **Practice** — ~88 questions, domain filters, "Not Sure/Brush Up", per-question notes, text-to-speech, and **multi-modal aids** after answering (key rule + formula + see-the-visual).
5. **Flashcards** — principles, terms, formulas.
6. **Formula Lab** — live EVM calculator, reference cards, and a **Formula Drill** (10 generators, fresh numbers, day-themed, accuracy/streak tracked).
7. **Videos** — topic videos (currently YouTube-search driven).
8. **Wrong Log / Weak Spots** — auto-collected misses, retry flow.
9. **Journal & Notes** — freeform notes + question notes export.
10. **War Room** — countdown, sprint progress, **exam-weighted readiness gauge**, pace vs 77s target, coach "do this next".
11. **Gamification** — XP, badges, streaks, confetti/sound.
12. **Cross-device sync** + **AI Coach** (needs funded key).

---

## 4. Gap analysis — what's missing or weak (audit these)

These are the real gaps, including direct learner complaints. **Verify each in the live app, then close it.**

### A. Content depth & freshness (highest priority)
- **Question bank is too small (~88) for 8h/day × 14 days.** Heavy repetition kills trust ("I've done this 100 times"). Target: **600–1,000+ questions**, balanced to exam weights (≈42/50/8), tagged by ECO task and PMBOK principle/performance domain, predictive vs agile, and difficulty.
- **Content not explicitly sourced/verified from PMI.** Build questions, lessons, and flashcards from the **ECO tasks**, **PMBOK 7 principles & performance domains**, and reputable sources. The learner can provide source text (e.g., PMBOK 7 audio/transcript) — design an ingestion path for learner-provided material.
- **Lessons are static.** Each `ls-*` lesson needs: a clear **objective**, a "do it" interactive, a **changing** check-yourself set, and a short "you've mastered this when…" exit check. Mindset lesson is the catch-all bucket (28 mapped questions) — redistribute via better `lessonFor` mapping.
- **No real full mock exam.** The "mock" boss is only ~10 questions. Build a true **180-question / 230-minute timed simulator** with section breaks, per-domain scoring, pace analytics, and a review mode. Schedule it on Day 11 & Day 13.

### B. The daily engine (8-hour guarantee)
- **Time blocks feel arbitrary / not a believable 8 hours.** Re-derive durations from real content volume so finishing a block ≈ real mastery work, not filler. Make blocks **content-exhausting** (e.g., "drill until you've seen N fresh questions at ≥80%") rather than purely clock-based.
- **No adherence/■enforcement or reminders.** Add real time-on-task tracking, "you're behind/ahead of today's plan," and optional timed reminders/notifications. Define what "today is complete" means objectively.
- **No spaced repetition.** Misses and brush-ups should resurface on a schedule (e.g., 1-day/3-day intervals) inside future run sheets. Tie the Wrong Log into tomorrow's warm-up automatically.
- **"It must roll."** Confirm the sheet always points to a next action, never dead-ends, survives a missed day, and rebuilds correctly for the current day.

### C. Measurement & "am I ready?"
- **Readiness is shallow.** Expand to: per-domain mastery vs target, predictive vs agile split, pace projection to 230 min, mock-exam history trend, and a clear **pass/no-pass projection** with the single highest-leverage next action.
- **No baseline diagnostic.** Add a short adaptive diagnostic on Day 1 to set a true starting line, then track the delta daily.
- **Study-time accounting** should feed readiness (time-on-task, questions completed, accuracy trend, schedule adherence all visible in one place).

### D. AI Coach (dynamic content engine)
- Make it the **always-fresh** layer: generate questions tied to **today's topic AND the learner's weak spots**, dedupe against seen questions, validate shape (4 options, valid index), and persist. Add graceful empty-balance / error messaging (partly done). Consider AI-generated **explanations**, **rationale for distractors**, and **lesson summaries** from learner-provided source text.
- Keep model id current; do not hardcode deprecated models.

### E. Robustness & polish
- **Audit every button on every page** for dead-ends/null-derefs (a stray note button was already found and fixed). No action should silently do nothing.
- Mobile pass (the learner may study on phone). Verify all new components are responsive.
- Accessibility of the TTS/audio features; verify they work across the app, not just Practice.
- Data safety: never lose progress; verify sync conflict handling (last-write-wins is current — confirm acceptable).

---

## 5. Workstreams & acceptance criteria (Definition of Done)

Tackle in priority order. Each must ship behind the existing PR workflow (push → Deploy Preview → verify → PR).

### WS1 — Content expansion & sourcing  *(biggest lever)*
- [ ] Question bank ≥ 600, balanced ≈42/50/8 across domains, tagged by ECO task + PMBOK principle/performance domain + predictive/agile + difficulty.
- [ ] Every question has a teaching explanation **and** a reason each distractor is wrong.
- [ ] Lessons rewritten with objective + interactive + changing checks; `lessonFor` remapped so no single bucket dominates.
- [ ] A documented sourcing method (ECO/PMBOK 7 + learner-provided text), with an ingestion path for learner material.
- **Done when:** a learner can drill any domain for an hour without obvious repetition, and every item traces to a PMI concept.

### WS2 — True mock exam simulator
- [ ] 180 Q / 230 min timed mode, two breaks, per-domain + overall scoring, pace report, full review mode, history saved and trended.
- [ ] Wired into Day 11 & 13 run sheets and the Path.
- **Done when:** the learner can sit a realistic exam and get an exam-style readout.

### WS3 — Daily engine v2 (8-hour, adherence, spaced repetition)
- [ ] Block durations re-derived from content; "complete" defined objectively (content + accuracy thresholds, not just time).
- [ ] Spaced repetition resurfacing of misses/brush-ups into future warm-ups.
- [ ] Adherence tracking + "ahead/behind" + optional reminders.
- **Done when:** finishing a day reliably equals ~8 hours of genuine, non-repetitive work and the system never dead-ends.

### WS4 — Readiness & diagnostics v2
- [ ] Day-1 baseline diagnostic; daily delta; per-domain vs target; pace projection; mock trend; explicit pass/no-pass projection + next action.
- **Done when:** at any moment the learner sees one honest number ("on pace / not yet") and the single best next step.

### WS5 — AI Coach hardening
- [ ] Weak-spot + today-topic targeting, dedupe vs seen, robust validation/persistence, friendly error states, current model id.
- **Done when:** one tap reliably yields fresh, on-target, exam-realistic questions (given a funded key).

### WS6 — Robustness/polish pass
- [ ] Click-through audit of every page/button; mobile pass; audio pass; data-safety/sync verification.
- **Done when:** no dead buttons, no console errors, clean on phone.

---

## 6. Constraints & guardrails for the implementing agent
- **Keep it a single static file** (`pmp.html`) unless a change genuinely requires otherwise; preserve the no-build, vanilla-JS approach and the existing visual language.
- **Never break saved progress.** `pmp_state_v2` is the learner's real data; migrate state shape additively (default-merge on load, as existing code does).
- **Always parse-check and fuzz-test** new JS before committing; verify in a Deploy Preview, not just locally.
- **Secrets:** `ANTHROPIC_API_KEY` lives in Netlify env (secret). Never commit keys; never echo them.
- **Ship via PR** (draft), with clear commit messages; don't push straight to production.
- **Verify, don't assume.** The learner values honesty about what's actually done vs partially done.

## 7. Open inputs the learner can provide
- PMBOK 7 text / audio transcript and any other study material (to source/verify content).
- Confirmed exam date (update `EXAM_DATE` and the sprint length if it changes).
- A funded Anthropic balance to switch the AI Coach fully on.

---

### One-line mission restatement
> Turn this into a coach that, every day, hands the learner a full 8-hour, PMI-sourced, non-repetitive plan; teaches it; tests it; tracks it; and tells them — honestly — whether they're on pace to pass, and what to do next.
