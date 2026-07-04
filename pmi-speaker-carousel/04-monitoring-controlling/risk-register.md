# Risk Register — PMISF-SPKR-2026

**Version:** 0.1 — July 4, 2026 (living document; reviewed at every stage gate per the Risk Management Plan)
Scoring: Probability × Impact, each 1–5. Score ≥ 12 = active mitigation required.

| ID | Risk | Category | P | I | Score | Response | Owner | Status |
|----|------|----------|---|---|-------|----------|-------|--------|
| R-1 | "PMI shape" interpretation mismatch — effect built on the wrong shape, causing rework | Scope | 4 | 4 | 16 | **Mitigate:** M3 design gate — 2–3 mockups, Sponsor picks before any code is written | Lead PM | Open |
| R-2 | Aptos font not legally embeddable in web/video output | Legal/Procurement | 4 | 3 | 12 | **Mitigate:** Research Agent verifies license in Planning; fallback to closest licensed/open font, documented in Procurement log | Research Agent | Open |
| R-3 | Real speaker headshots late or unusable for pop-out (low-res, busy background, head not croppable) | External | 3 | 4 | 12 | **Mitigate:** build with placeholders (A-4); publish a photo-spec sheet for speakers; **Contingency:** background-removal step in pipeline | Lead PM | Open |
| R-4 | No GUI screen recorder in cloud environment — video export path uncertain | Technical | 3 | 4 | 12 | **Mitigate:** programmatic render (headless browser frames → ffmpeg) proven with a spike BEFORE full build (M4 includes render spike) | Dev Agent | Open |
| R-5 | Brand non-compliance found late (colors, logo placement, fonts) | Quality | 2 | 4 | 8 | **Mitigate:** brand checklist run by QA Agent at M3, M4, M5 — not just at the end | QA Agent | Open |
| R-6 | Sponsor unavailable at a decision gate, stalling the schedule | Communication | 3 | 2 | 6 | **Accept/Mitigate:** PM proceeds on documented assumptions (Assumption Log) and flags decisions as reversible until confirmed | Lead PM | Open |
| R-7 | Chapter-side rejection (Ryan) after Sponsor acceptance | Stakeholder | 2 | 3 | 6 | **Mitigate:** follow established brand rules Ryan already approved on the 5K project (logo top-left, real photos) | Lead PM | Open |
| R-8 | Scope creep — new formats/platforms requested mid-build | Scope | 3 | 2 | 6 | **Mitigate:** template is data-driven and resolution-independent where possible; changes go through Change Log | Lead PM | Open |

## Risk review schedule
- Stage-gate reviews at M2 (planning baseline), M3 (design), M4 (build), M5 (delivery), M6 (closing — final risk closeout in lessons learned).
