# Project Charter — PMI South Florida Rotating Speaker Carousel

**Project Code:** PMISF-SPKR-2026
**Date:** July 4, 2026
**Version:** 0.1 — DRAFT, pending Sponsor sign-off
**Sponsor:** Terrence Michael Scott (King SUMMERBODY)
**Project Manager:** Claude (AI Lead PM)

---

## 1. Project Purpose / Business Justification

PMI South Florida promotes chapter events (meetings, professional development days, conferences) on social media. The previous 5K carousel project (closed March 25, 2026) proved that branded carousel content works, but it was a static PowerPoint build — every new event means redesigning from scratch. This project delivers a **coded, animated, reusable speaker-carousel system** so the chapter can announce event speakers with a distinctive motion-graphic look (speaker headshots popping out of a PMI-branded shape) and regenerate content for future events in minutes instead of days.

## 2. Measurable Project Objectives and Success Criteria

| # | Objective | Success Criterion |
|---|-----------|-------------------|
| 1 | Animated rotating speaker carousel, built in code (HTML/CSS/JS) | Runs in a browser at 60fps; each speaker card shows headshot popping out of the PMI shape with name, title, and session topic |
| 2 | Video export for social media | MP4 delivered in at least one social-ready aspect ratio, plays cleanly, under platform file-size limits |
| 3 | Reusable template system | Sponsor (non-developer) can swap in a new speaker by editing one data file and dropping in a headshot image — no code changes |
| 4 | Brand compliance | 100% pass on the PMI brand-compliance checklist (colors, logo placement, fonts, real photos) |
| 5 | Sponsor acceptance | Formal written acceptance from the Sponsor at Closing |

## 3. High-Level Requirements

- **HLR-1:** Carousel rotates through speakers automatically (and/or on click/swipe).
- **HLR-2:** Signature visual effect: each speaker's head "pops out" above the boundary of a PMI-branded shape.
- **HLR-3:** PMI South Florida brand rules apply: Violet `#4F17AB`, Aqua `#05BFE0`, Tangerine `#FF610F`; Aptos / Aptos Bold typography; PMI logo top-left or bottom-left only; real photos only, no stock icons.
- **HLR-4:** Output formats: live web carousel + MP4 video + regenerable static slides (per Assumption A-1 until Sponsor confirms).
- **HLR-5:** Template accepts N speakers (design target 3–8) with name, title/credential, organization, and session topic per speaker.

## 4. High-Level Project Description and Boundaries

**In scope:** design mockups of the pop-out effect; a coded carousel component; animation; video rendering; a data-driven template; documentation for reuse; QA against brand rules.

**Out of scope (unless changed via Change Control):** posting/scheduling to social platforms (Andreas owns Buffer); collecting speaker headshots and bios from real speakers; PMI national brand approval; paid tooling or licenses.

## 5. Milestone Schedule (high level — baselined in Planning)

| Milestone | Target |
|-----------|--------|
| M1 — Charter approved by Sponsor | On Sponsor's reply |
| M2 — Planning complete (PM Plan, WBS, DoD, Risk Register baselined) | M1 + 1 working session |
| M3 — Design concepts (2–3 pop-out mockups) delivered for Sponsor selection | M2 + 1 session |
| M4 — Working animated carousel (placeholder speakers) | M3 + 1–2 sessions |
| M5 — Video export + template docs delivered | M4 + 1 session |
| M6 — Sponsor acceptance and project closure | On Sponsor sign-off |

## 6. Preapproved Financial Resources

Volunteer project: $0 cash budget. Costs tracked as AI-agent effort and free/open-source tooling only. Any paid asset or license requires Sponsor approval (Procurement).

## 7. Key Stakeholders

See `stakeholder-register.md`. Sponsor/Customer: Terrence Michael Scott. Chapter-side influencers: Ryan (marketing direction), Andreas (Buffer scheduling), Neha (graphics/emails).

## 8. High-Level Risks (seeded into the Risk Register)

- R-1: "PMI shape" interpretation mismatch — design built on the wrong shape. *Mitigated by M3 mockup gate.*
- R-2: Font risk — Aptos is a Microsoft font, not freely web-licensable; may need a licensed fallback for web/video.
- R-3: Real speaker assets (headshots with clean croppable heads) arrive late or low-quality — pop-out effect needs high-resolution photos with clear head separation.
- R-4: Video rendering in a cloud environment (no GUI screen recorder) — requires a programmatic render pipeline (e.g., canvas frames to ffmpeg).
- R-5: Brand non-compliance discovered late — mitigated by QA checklist at every stage gate.

## 9. OPEN QUESTIONS FOR THE SPONSOR — answer in your next message

The PM proceeds under the Assumption Log until these are answered. **Just reply with the question numbers and your answers.**

1. **Deliverable formats:** Plan of record is all three — (a) animated web carousel, (b) MP4 video, (c) reusable template. Confirm, or cut any? Sponsor Answer: Yes that is correct. all 3 outputs. ned all of them to be editiable. As we do not have everything at this time. need a prototype.
2. **The PMI shape:** Which shape do heads pop out of — the PMI logo mark itself, the brand template shapes (purple triangles / orange circles / aqua shapes), or a PMI-colored circle badge? *PM recommendation: I have the design agent mock up 2–3 variations and you pick at Milestone M3.* Sponsor Answer: Yes that is correct.
3. **Event and deadline:** Is this for a specific event with a date (which one, when does it need to publish?), or an evergreen template for recurring chapter meetings?Sponsor Answer: Yes that is correct. Thisis for a specific event adn date adn tiome that I will als update. so that too should be left blank at this time and I will fill it in later in Canva when I edit it. 
4. **Speakers:** How many speakers for version 1, and do you have headshots/names/titles now? *PM recommendation: build with 4–6 placeholders, swap real speakers in later.* Sponsor Answer: Yes that is correct build the templte with [;laceholders. I do not know or have the information that is needed at this time. This is an agile project. 
5. **Video spec:** Which platforms first — Instagram feed (1080×1350), Instagram Reels/Stories (1080×1920), LinkedIn (1080×1080 or 1920×1080)? How long should the video run? Sponsor Answer: Yes that is correct.
6. **Brand confirmation:** This uses **PMI chapter branding** (violet/aqua/tangerine), NOT the SUMMERBODY brand (orange/black) — correct? Sponsor Answer: Yes that is correct. Nothing to do with SUMMEBRODY. it should be PMI adn I will give ou the Colorr codes as twhich ever color use all that has to be in a shade of the smae color but diffent. not sure how to explain it in tesxt at the moment. 

## 10. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Sponsor | Terrence Michael Scott | Signed: Terrence Scott | |
| Project Manager | Claude (AI Lead PM) | Approved to proceed to Planning upon Sponsor reply | July 4, 2026 |
