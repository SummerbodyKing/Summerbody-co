# Work Breakdown Structure — PMISF-SPKR-2026

**Version:** 1.0 — July 4, 2026. 100% rule: this is the entire scope; anything else is a change request.

```
1.0 PMI SF Rotating Speaker Carousel
├── 1.1 Project Management
│   ├── 1.1.1 Initiating (charter, stakeholders, assumptions) ✅ DONE
│   ├── 1.1.2 Planning (this package)
│   ├── 1.1.3 Monitoring & Controlling (risk reviews, change log, gate QA)
│   └── 1.1.4 Closing (acceptance, lessons learned)
├── 1.2 Research
│   ├── 1.2.1 Font licensing verification + fallback selection (R-2)
│   ├── 1.2.2 Pop-out effect technique research
│   ├── 1.2.3 Video render pipeline selection (R-4)
│   └── 1.2.4 Monochromatic tint/shade ramps for PMI colors (D-4)
├── 1.3 Design (M3)
│   ├── 1.3.1 Placeholder speaker set (4–6 CC0/generated headshots, dummy names/titles)
│   ├── 1.3.2 Mockup A / B / C — pop-out effect variations
│   ├── 1.3.3 Sponsor selection + one refinement round
│   └── 1.3.4 Design tokens (color ramps, type scale, spacing, logo zone)
├── 1.4 Carousel Build (M4 — prototype increment)
│   ├── 1.4.1 Data schema: speakers.json (name, title, org, topic, photo) + event.json (name, date, time — placeholder values, D-2)
│   ├── 1.4.2 Speaker card component with pop-out effect
│   ├── 1.4.3 Rotation engine (auto-rotate + manual controls)
│   ├── 1.4.4 Aspect-ratio layouts: 1080×1350 primary, 1080×1080 secondary
│   └── 1.4.5 Render-spike: prove browser → MP4 pipeline early (R-4)
├── 1.5 Outputs (M5 — delivery increment)
│   ├── 1.5.1 MP4 export, 15–20s, per aspect ratio
│   ├── 1.5.2 Static slide exports (high-res PNG per speaker) — Canva-friendly, date/time zones blank (D-2)
│   ├── 1.5.3 Template documentation: "swap a speaker in 5 minutes" guide for the Sponsor
│   └── 1.5.4 Handoff package (files organized for Buffer/Canva workflows)
└── 1.6 Quality
    ├── 1.6.1 Brand compliance checks at M3 / M4 / M5
    ├── 1.6.2 Cross-format verification (video plays, statics correct size)
    └── 1.6.3 DoD verification before each gate
```

## Explicitly OUT of scope (from Charter §4)
Posting/scheduling (Buffer), collecting real speaker assets, PMI national approval, paid tooling, building inside Canva itself (deliverables are Canva-*compatible*; Canva editing is the Sponsor's workflow).
