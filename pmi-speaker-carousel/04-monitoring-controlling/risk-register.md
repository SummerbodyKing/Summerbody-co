# Risk Register — PMISF-SPKR-2026

**Version:** 1.1 — July 4, 2026, updated at M2 risk review after charter sign-off (living document; reviewed at every stage gate per the Risk Management Plan)
Scoring: Probability × Impact, each 1–5. Score ≥ 12 = active mitigation required.

| ID | Risk | Category | P | I | Score | Response | Owner | Status |
|----|------|----------|---|---|-------|----------|-------|--------|
| R-1 | "PMI shape" interpretation mismatch — effect built on the wrong shape, causing rework | Scope | 4 | 4 | 16 | **Mitigate:** M3 design gate — 2–3 mockups, Sponsor picks before any code is written | Lead PM | Open |
| R-2 | Aptos font not legally embeddable in web/video output | Legal/Procurement | 4 | 3 | 12 | **CONFIRMED by research:** Aptos web self-hosting is prohibited under Microsoft's license. **Response executed:** switch to Inter (Google Fonts, OFL) for web AND video; Schibsted Grotesk / Open Sans as alternates. Sponsor sees Inter in the M3 mockups and confirms there. | Research Agent | Mitigated — pending Sponsor view at M3 |
| R-3 | Real speaker headshots late or unusable for pop-out (low-res, busy background, head not croppable) | External | 3 | 4 | 12 | **Mitigate:** build with placeholders (A-4); publish a photo-spec sheet for speakers; **Contingency:** background-removal step in pipeline | Lead PM | Open |
| R-4 | No GUI screen recorder in cloud environment — video export path uncertain | Technical | 3 | 4 | 12 | **Mitigate:** pipeline selected by research — Playwright frame-stepping (pause animations, seek per frame) piped to ffmpeg libx264/yuv420p at 30fps; proven with a spike at M4 before full build. Remotion (free for nonprofits) is the fallback. | Dev Agent | Open — response defined |
| R-5 | Brand non-compliance found late (colors, logo placement, fonts) | Quality | 2 | 4 | 8 | **Mitigate:** brand checklist run by QA Agent at M3, M4, M5 — not just at the end | QA Agent | Open |
| R-6 | Sponsor unavailable at a decision gate, stalling the schedule | Communication | 3 | 2 | 6 | **Accept/Mitigate:** PM proceeds on documented assumptions (Assumption Log) and flags decisions as reversible until confirmed | Lead PM | Open |
| R-7 | Chapter-side rejection (Ryan) after Sponsor acceptance | Stakeholder | 2 | 3 | 6 | **Mitigate:** follow established brand rules Ryan already approved on the 5K project (logo top-left, real photos) | Lead PM | Open |
| R-8 | Scope creep — new formats/platforms requested mid-build | Scope | 3 | 2 | 6 | **Mitigate:** template is data-driven and resolution-independent where possible; changes go through Change Log | Lead PM | Open |
| R-9 | Canva editability mismatch — Sponsor plans to edit event date/time in Canva (D-2), but coded/video outputs are not natively Canva-editable | Scope/Technical | 4 | 3 | 12 | **Mitigate:** static exports delivered as high-res PNGs with date/time zones left blank for Canva overlay; confirm workflow with Sponsor at M3 using one sample export | Lead PM | Open — added at M2 review |
| R-10 | Final color codes pending — Sponsor will supply exact monochromatic codes later (D-4); building on wrong ramp causes rework | Scope | 3 | 2 | 6 | **Mitigate:** all colors implemented as swappable design tokens; ramps generated from PMI base colors as defaults | Design Agent | Open — added at M2 review |

## M2 risk review notes (July 4, 2026)
- R-1 downgraded in practice: Sponsor approved the mockup-gate mitigation, so exposure is contained at M3.
- R-6 partially realized and handled: interactive Q&A tooling failed; written Q&A via the charter worked — this is now the standard decision channel.
- R-2 and R-4 under active investigation by the Research Agent (brief lands in `02-planning/research-brief.md`).

## Risk review schedule
- Stage-gate reviews at M2 ✅ (this update), M3 (design), M4 (build), M5 (delivery), M6 (closing — final risk closeout in lessons learned).
