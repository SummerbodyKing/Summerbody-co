# Project Management Plan — PMISF-SPKR-2026

**Version:** 1.0 — July 4, 2026
**Approach:** HYBRID — PMBOK governance (stage gates, risk reviews, change control) with agile iterative delivery, per Sponsor decision D-3.

Each section below is the subsidiary plan for one of the 10 Knowledge Areas.

---

## 1. Integration Management
- Charter approved (v1.0, July 4, 2026). This PM Plan integrates all subsidiary plans.
- All changes to baselined scope/schedule go through the **Change Log** (`04-monitoring-controlling/change-log.md`), approved by the Sponsor.
- Lead PM directs and manages work by delegating to specialist AI agents and verifying their outputs before anything reaches the Sponsor.

## 2. Scope Management
- Scope baseline = Charter high-level requirements + `wbs.md` + `definition-of-done.md`.
- Requirements collected from: Sponsor answers (charter Section 9), Sponsor decisions D-1 to D-4, prior-project brand rules, Research Brief.
- **Validate Scope:** Sponsor formally accepts each increment at its milestone gate.
- **Control Scope:** anything not in the WBS is a change request. Known temptations to watch: extra platforms, extra aspect ratios, chapter-requested variants.

## 3. Schedule Management
Session-based schedule (no external date yet — event date is a Sponsor-supplied placeholder, D-2):

| Milestone | Gate criteria | Iteration style |
|-----------|--------------|-----------------|
| M2 — Planning baselined | Sponsor reviews this plan (tacit approval: no objection at next check-in) | — |
| M3 — Design concepts | 2–3 pop-out mockups delivered; **Sponsor picks one** | Iterate on picked concept |
| M4 — Working prototype carousel | Animated carousel with placeholder speakers runs in browser; Sponsor feedback round | Agile increment 1 |
| M5 — Full delivery | MP4 render + Canva-friendly statics + template docs | Agile increment 2 |
| M6 — Closing | Sponsor acceptance, lessons learned, risk closeout | — |

## 4. Cost Management
$0 cash. Track: agent invocations (effort), free/open tooling only. Any paid font, stock asset, or service = Sponsor approval via Procurement log BEFORE use.

## 5. Quality Management
- Quality standard = `definition-of-done.md` (per-deliverable DoD + brand compliance checklist).
- QA Agent runs the checklist at M3, M4, M5 — quality is gated in, not inspected in at the end.
- Prototype-first (D-1): quality bar for increment 1 is "demonstrates the concept honestly," for final delivery it is "publishable as-is."

## 6. Resource Management — Agent Team & RACI
| Work | Research | Design | Dev | Motion/Video | QA | Lead PM | Sponsor |
|------|----------|--------|-----|--------------|----|---------|---------|
| Research brief | R | C | C | C | — | A | I |
| Design mockups (M3) | C | R | — | C | C | A | **Decides** |
| Carousel build (M4) | — | C | R | C | C | A | I |
| Video render (M5) | — | — | C | R | C | A | I |
| Template docs | — | — | R | — | C | A | I |
| Brand QA (each gate) | — | — | — | — | R | A | I |
R = Responsible, A = Accountable (always Lead PM), C = Consulted, I = Informed. Sponsor is the single decision authority at gates.

## 7. Communications Management
- **Sponsor updates:** at every milestone gate + whenever a decision is needed. Format: plain-language summary first, links to artifacts second.
- **Everything in writing** in this repo; chat messages summarize, documents are the record.
- Open decisions the Sponsor still owes (tracked, not blocking): event date/time, final color codes, real speaker assets.

## 8. Risk Management
- Living register: `04-monitoring-controlling/risk-register.md`. Scoring P×I (1–5 each); score ≥ 12 requires active mitigation.
- **Risk reviews at every milestone gate** (M2–M6) — register updated, new risks added, dead risks closed.
- Escalation: any risk that threatens a charter objective goes to the Sponsor immediately.

## 9. Procurement Management
No purchases planned. Acquisition log for zero-cost externals (fonts, libraries) kept in `procurement-log.md` with license verified BEFORE adoption (ties to R-2). Placeholder headshots must be license-free (generated or CC0).

## 10. Stakeholder Engagement
- Sponsor: engaged at every gate (Leading).
- Ryan: Terrence presents M3 winner and final deliverables chapter-side; design deliberately follows rules Ryan already approved on the 5K project.
- Andreas/Neha: informed at delivery with Buffer-ready packaging.
- Speakers: photo-spec sheet (from DoD) given to Sponsor for when real speakers are collected.
