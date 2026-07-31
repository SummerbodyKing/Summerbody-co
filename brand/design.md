# Brand Design System (design.md)

**Version:** 1.0 · **Date:** 2026-07-23 · **Source of truth:** this file
**Derived from:** "Colors and fonts" slide of the 2025 modified PMI presentation template (Canva "2025 Brand Kit")

This is the single reference for producing anything visual for the brand: PowerPoint decks, Canva designs, Instagram carousels, video title cards, and thumbnails. If a value isn't in this file, it isn't on-brand. Machine-readable versions of every token live in [`tokens.json`](tokens.json) and [`tokens.css`](tokens.css).

---

## 1. Color System

Every color has a main value plus a five-step ramp (lightest → darkest). Use the main value by default; use ramp steps only for tints/shades of the same role (hover states, chart series, background washes) — never as substitutes for another role's color.

### 1.1 Primary — Violet (Logo / Main Brand Color · Accent 1)

| Role | Hex |
|---|---|
| **Main** | `#461DA3` |
| Lightest | `#D4C6F5` |
| Light | `#A98EEC` |
| Mid | `#8158E3` |
| Dark | `#36177B` |
| Darkest | `#270F53` |

### 1.2 Secondary — Aqua (Accents 2 & 3)

| Role | Teal-blue (Accent 2) | Sky-cyan (Accent 3) |
|---|---|---|
| **Main** | `#44789B` | `#6CBEDE` |
| Lightest | `#C9EFFE` | `#D5F6FE` |
| Light | `#9ADDFE` | `#B0EBFC` |
| Mid | `#79CDFD` | `#92E2FA` |
| Dark | `#345B74` | `#508EA6` |
| Darkest | `#233E4F` | `#37606F` |

### 1.3 Accent / Highlight — Tangerine & Saddle (Accents 4, 5 & 6)

| Role | Burnt orange (Accent 4) | Bright orange (Accent 5) | Warm tan (Accent 6) |
|---|---|---|---|
| **Main** | `#B83713` | `#E0611F` | `#B29478` |
| Step 1 | `#A53311` | `#F6DECF` | `#EFE9E3` |
| Step 2 | `#8A2B0D` | `#EFBF9F` | `#E0D4C8` |
| Step 3 | `#5C2009` | `#E89F71` | `#D0BEAC` |
| Step 4 | `#311004` | `#B0470A` | `#906E4E` |
| Step 5 | `#180601` | `#753205` | `#614A36` |

Note: Accent 4's ramp runs main → darker only; Accent 5's and 6's ramps run light → dark around the main value. Treat Accent 5 (`#E0611F`) as the default CTA/highlight orange; Accent 4 (`#B83713`) is its darker, more serious sibling.

### 1.4 Neutrals — Text / Background

| Role | Light (warm cream) | Dark (gray) |
|---|---|---|
| **Main** | `#F6F4EF` | `#7F7F7F` |
| Step 1 | `#E4DDCE` | `#E5E5E5` |
| Step 2 | `#C8BB9E` | `#CBCBCB` |
| Step 3 | `#998355` | `#B1B1B1` |
| Step 4 | `#4E442E` | `#606060` |
| Step 5 | `#242016` | `#424242` |

Default page background: `#F6F4EF` (light mode) or `#270F53` (dark/violet mode). Default body text: `#242016` on light backgrounds, `#F6F4EF` on dark.

### 1.5 Color usage ratio — the 50/30/20 rule

The template's "Color Usage" chart encodes a ratio; here it is as an explicit rule:

- **~50% Violet** — dominant color: large backgrounds, title cards, headers, cover slides.
- **~30% Aqua** — supporting color: data elements, secondary panels, dividers, icons.
- **~20% Tangerine/Saddle** — emphasis only: CTAs, highlights, arrows, key stats, "swipe" cues. Never use an accent orange as a background for a full slide.

If a design feels off-brand, check this ratio first — the most common failure is orange creep past 20%.

### 1.6 Accessibility — verified contrast (WCAG 2.1)

Computed ratios; AA requires ≥ 4.5:1 for body text, ≥ 3:1 for large text (24px+/19px bold+).

| Pairing | Ratio | Verdict |
|---|---|---|
| White on `#461DA3` (violet main) | 10.69 | ✅ AAA — safe everywhere |
| White on `#270F53` (violet darkest) | 16.41 | ✅ AAA — safe everywhere |
| `#D4C6F5` on `#270F53` | 10.31 | ✅ AAA |
| White on `#44789B` (teal-blue) | 4.77 | ✅ AA body text |
| White on `#345B74` (teal dark) | 7.25 | ✅ AAA |
| `#270F53` on `#6CBEDE` (sky-cyan) | 7.86 | ✅ AAA |
| White on `#6CBEDE` | 2.09 | ❌ **Never** put white text on sky-cyan |
| White on `#B83713` (burnt orange) | 5.84 | ✅ AA body text |
| White on `#E0611F` (bright orange) | 3.56 | ⚠️ Large text only |
| `#E0611F` on `#270F53` | 4.61 | ✅ AA — the signature "orange on dark violet" combo |
| White on `#B29478` (tan) | 2.84 | ❌ Use dark text on tan |
| White on `#7F7F7F` (gray main) | 4.00 | ⚠️ Large text only |
| `#242016` / `#270F53` / `#461DA3` on `#F6F4EF` | 14.77 / 14.93 / 9.72 | ✅ AAA |

**Hard rules:** on `#6CBEDE`, `#B29478`, and all "lightest/light" ramp steps, text must be `#270F53` or `#242016`. Bright orange `#E0611F` carries headlines and buttons, never paragraph text on it in white.

---

## 2. Typography

### 2.1 Typefaces

- **Headings:** Aptos Bold
- **Body:** Aptos (Regular)

Aptos is Microsoft's default Office font (successor to Calibri) — free and pre-installed on Windows/Office, but **not** bundled in Canva or most social tools. It must be uploaded to the Canva Brand Kit as a brand font. If Aptos is unavailable on a platform, the approved fallback stack is: **Aptos → Inter → Helvetica Neue → Arial** (Inter is the closest freely licensed match in proportions and tone).

### 2.2 Type hierarchy (documents & slides, 16:9)

| Style | Font | Size | Line height | Color | Case |
|---|---|---|---|---|---|
| H1 / Slide title | Aptos Bold | 48pt | 1.1 | `#242016` or `#F6F4EF` | Sentence case |
| Subtitle / Eyebrow | Aptos Bold | 30pt | 1.2 | Violet family (`#461DA3` / `#8158E3`) | Sentence case |
| H2 / Section head | Aptos Bold | 28pt | 1.2 | `#461DA3` | Sentence case |
| H3 | Aptos Bold | 20pt | 1.3 | `#242016` | Sentence case |
| Body | Aptos | 16pt | 1.4–1.5 | `#242016` | Sentence case |
| Caption / Footnote | Aptos | 11pt | 1.3 | `#606060` | Sentence case |

The subtitle is a formal "eyebrow" style: always colored in the violet family, never pure black. **Sentence case everywhere** — the template itself uses "Colors and fonts", not "Colors And Fonts". No all-caps except tiny labels/tags (max 2–3 words, letter-spaced +5–8%).

### 2.3 Type hierarchy (Instagram carousel, 1080×1350)

| Style | Font | Size (px) | Line height | Notes |
|---|---|---|---|---|
| Hook headline (slide 1) | Aptos Bold | 88–110 | 1.05 | Max ~8 words |
| Slide headline | Aptos Bold | 64–72 | 1.1 | Max 2 lines |
| Body | Aptos | 36–42 | 1.35 | Max ~40 words per slide |
| Eyebrow/label | Aptos Bold | 28 | 1.2 | Violet or accent color, may be all-caps |
| Page number / handle | Aptos | 24–28 | 1.0 | Corner placement |

Minimum text size anywhere on a social canvas: **28px** — anything smaller dies on mobile.

---

## 3. Logo Rules

- **Primary logo color** is the brand violet `#461DA3`.
- **Approved backgrounds:** cream `#F6F4EF`, white, and light ramp tints (`#D4C6F5`, `#C9EFFE`, `#EFE9E3`). On dark backgrounds (`#270F53`, `#36177B`, `#242016`) use a white or `#D4C6F5` knockout version — the violet logo disappears on dark fields.
- **Never** place the logo on `#6CBEDE`, orange fields, or over busy photos without a solid backing shape.
- **Clearspace:** keep empty space around the logo equal to the height of its tallest letterform (the "x-height rule") on all sides.
- **Minimum size:** 120px wide on social canvases; 0.75in in print/decks.
- One logo per canvas. On carousels, logo/handle appears small in a consistent corner (see §6), full-size only on the cover and end card.

---

## 4. Layout, Spacing & Grid

- **Base spacing unit: 8px.** All padding, gaps, and margins are multiples of 8 (8 / 16 / 24 / 32 / 40 / 80).
- **Safe margin:** 80px on all sides of a 1080-wide social canvas; 0.5in on slides.
- **Corner radius standard:** 16px for cards/panels, 999px (full pill) for buttons/tags, 0 for full-bleed images. Pick one radius per design — don't mix 8 and 24 on the same canvas.
- **Grid:** 12-column grid on slides; 6-column on 1080px social canvases (72px columns, 24px gutters, inside the 80px margins).
- **Alignment:** left-align text by default; center only cover-slide hooks and end-card CTAs.

## 5. Photography & Iconography

- **Icons:** flat, single-weight line icons (2–3px stroke at 48px artboard), in violet `#461DA3` on light backgrounds or cream/`#D4C6F5` on dark. No gradients, no drop shadows, one icon family per design.
- **Photos:** natural light, warm tone to harmonize with the cream neutral. Approved treatment for text-over-photo: a `#270F53` overlay at 40–60% opacity, or a violet-to-transparent gradient from the text edge.
- **Illustration:** flat, geometric, using ramp tints of one palette family plus one accent — never all six accents in one illustration.

---

## 6. Instagram Carousel Spec

**Canvas:** 1080×1350 (4:5). Never 1:1 — 4:5 gets more feed real estate. Design one master file; export all slides at the same size.

**Safe zones:** 80px margin all sides; additionally keep the bottom ~180px and top ~120px free of critical text (profile bar and CTA overlays in the feed UI).

**Slide architecture:**
1. **Slide 1 — Hook.** Its own template, visually distinct from body slides: violet-dominant background (`#461DA3` or `#270F53`), hook headline at 88–110px, an orange `#E0611F` accent element (underline, arrow, or highlight bar), and a "swipe" cue bottom-right.
2. **Slides 2–9 — Body.** Cream `#F6F4EF` or light-tint backgrounds, one idea per slide, headline + max ~40 words. Repeating header/eyebrow so mid-carousel screenshots are still branded.
3. **Final slide — End card.** Back to violet-dominant. One CTA in orange (follow / save / share / link in bio). Logo + handle at full size.

**Persistent furniture (every slide, same position):**
- Page indicator ("2/8" or dot row) — bottom corner, accent color.
- Swipe arrow in `#E0611F` on every slide except the last.
- Handle (@…) small, in one fixed corner.

**Content-pillar color coding:** assign each content pillar one accent and keep it forever, so followers recognize the topic at a glance:
- Pillar A (e.g., education/how-to) → teal-blue `#44789B`
- Pillar B (e.g., motivation/story) → bright orange `#E0611F`
- Pillar C (e.g., news/announcements) → sky-cyan `#6CBEDE` (dark text only)
The pillar color drives the eyebrow, page dots, and accent shapes — the violet base never changes.

**Legibility check before export:** view every slide at 25% zoom (thumbnail size). If the headline isn't readable, the type is too small or the contrast pairing violates §1.6.

---

## 7. Video Titles & Thumbnails

**Title card template:** violet-dominant field (`#270F53` or `#461DA3`), title in Aptos Bold cream/white, one orange `#E0611F` accent element (keyword highlight, underline bar, or arrow). This mirrors the 50/30/20 ratio at card scale.

**Title writing rules:**
- **Sentence case**, matching the slide convention ("Colors and fonts", not "Colors And Fonts").
- **On-thumbnail text: max 4–5 words / ~24 characters** — it must read at 320px wide on a phone.
- **Platform title text: front-load the first 40 characters** with the payoff; YouTube truncates around 50–60, and search/suggested surfaces cut earlier on mobile.
- Highlight exactly **one** word per title in orange — the emotional or payoff word. Two highlights = zero highlights.

**Thumbnail rules:** face or subject on one third, text on the other; text never over the face; `#270F53` overlay behind text when placed on a photo; keep the bottom-right corner clear (timestamp badge covers it).

**Lower-thirds / captions in video:** Aptos Bold on a `#461DA3` or `#270F53` bar, cream text, pill or square-corner consistent with §4's radius choice.

---

## 8. Canva & PowerPoint Production Notes

- **Build the Canva Brand Kit, don't rely on reference slides.** Enter all §1 palettes as named palettes ("Violet", "Aqua", "Tangerine", "Saddle", "Neutrals") and upload Aptos/Aptos Bold as brand fonts. Then every value is one click away in any new design.
- **Font substitution risk:** this template is a PPTX imported into Canva. If the file is reopened in native PowerPoint on a machine without Aptos, Office may silently substitute; embed fonts on save (File → Options → Save → Embed fonts) or export to PDF for sharing.
- **Create Canva Brand Templates** (not just designs) for: carousel hook slide, carousel body slide, carousel end card, video title card, thumbnail. Producing a new post should be fill-in-the-blanks, never design-from-scratch.
- **Charts:** chart series colors come from one palette's ramp (e.g., all violet steps), with orange reserved for the single data point being emphasized.
- **Export settings:** PNG for carousel slides (JPG compresses flat color badly), 1080×1350 at 1× (no scaling), sRGB.

## 9. File Naming & Versioning

`[platform]-[type]-[topic]-[vN]` — e.g., `ig-carousel-5mistakes-v2`, `yt-thumb-morningroutine-v1`. One master Canva folder per platform; archive superseded versions, never delete (old posts may need re-exports).

## 10. Quick Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Violet dominant, orange sparing (50/30/20) | Full-orange or full-cyan backgrounds |
| Sentence case titles | Title Case or ALL CAPS headlines |
| Dark text on sky-cyan/tan/light tints | White text on `#6CBEDE`, `#B29478`, `#E0611F` body copy |
| One accent + violet per design | All six accent colors on one canvas |
| 4:5 (1080×1350) carousels, 80px margins | Square posts, text at the canvas edge |
| One orange highlight word per title | Multiple highlights, orange paragraphs |
| Knockout (white/`#D4C6F5`) logo on dark | Violet logo on dark or busy backgrounds |
