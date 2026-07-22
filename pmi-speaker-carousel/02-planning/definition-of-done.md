# Definition of Done + Quality Checklists — PMISF-SPKR-2026

**Version:** 1.0 — July 4, 2026. QA Agent verifies these at each gate; a deliverable is not "done" until every line passes.

## Brand Compliance Checklist (runs at M3, M4, M5)
- [ ] Only PMI chapter colors used: Violet #4F17AB, Aqua #05BFE0, Tangerine #FF610F — plus tints/shades from the approved ramps (D-4)
- [ ] Monochromatic rule respected: one base color family per design, varied only by tint/shade
- [ ] PMI logo present, top-left or bottom-left only, unmodified, legible
- [ ] Typography: Aptos, or the licensed fallback approved via the Research Brief (R-2) — no other fonts
- [ ] Real photos only in final output (placeholders clearly marked as placeholders until then)
- [ ] No SUMMERBODY brand elements anywhere

## DoD — M3 Design Mockups
- [ ] 2–3 visually distinct pop-out variations, each on the 1080×1350 canvas
- [ ] Each shows: headshot popping out of shape, speaker name, title/credential, topic line, PMI logo, blank event date/time zone
- [ ] Brand checklist passes
- [ ] Presented to Sponsor with a one-line tradeoff note per option

## DoD — M4 Prototype Carousel
- [ ] Opens in a plain browser from a single HTML file or folder — no install steps for the Sponsor
- [ ] Auto-rotates through all placeholder speakers; manual next/prev works
- [ ] All content driven from `speakers.json` + `event.json` — zero text hardcoded in markup (D-1: everything editable)
- [ ] Animation smooth (no visible jank) in Chrome
- [ ] Render-spike proven: at least one 3-second MP4 produced programmatically (retires R-4)
- [ ] Brand checklist passes

## DoD — M5 Final Delivery
- [ ] MP4: 15–20s, 1080×1350 (+1080×1080 if unchanged scope), ≤ platform size limits, clean start/end loop
- [ ] Static slides: one high-res PNG per speaker + cover, date/time zone blank for Canva fill-in (D-2)
- [ ] Template guide written for a non-developer: swap a speaker by editing one JSON entry + dropping one image
- [ ] A test run of the guide performed by the QA Agent as if they were the Sponsor
- [ ] Handoff package organized in one folder with a README
- [ ] Brand checklist passes

## Speaker Photo Spec (given to Sponsor for real speakers — mitigates R-3)
- Minimum 1000px on the short side; head and shoulders visible; head not cropped at top
- Clean or removable background (transparent PNG ideal)
- Face sharp and front-lit; no sunglasses/heavy shadows
