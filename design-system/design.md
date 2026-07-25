# OG Presido Design System

**"Scrapbook Editorial"** — the visual language behind the @joel_ooreofe carousel series
(Clarity Calls, Creative Writing, and the notebook letter slides).

The style mixes two worlds that alternate across a carousel:

1. **Poster slides** — dark, textured backgrounds, gigantic condensed headlines, halftone
   collage cutouts (rotary phone, pen), and loud yellow sticker CTAs.
2. **Notebook slides** — cream ruled paper, handwritten script, underlines and ink-red
   emphasis, like a personal letter to the reader.

Loud on the outside, intimate on the inside. Every rule below serves that contrast.

---

## 1. Design Principles

| Principle | What it means in practice |
|---|---|
| **Type is the image** | Headlines fill 60–80% of the slide width. If the headline doesn't dominate, it's too small. |
| **Analog over digital** | Halftone cutouts, torn paper, tape, grain, dashed "cut here" borders, hand-drawn doodles. Nothing should feel like a default Canva shape. |
| **One loud accent** | Yellow is the only saturated color on poster slides. Red ink is the only accent on notebook slides. Never both at full volume on one slide. |
| **Imperfection is intentional** | Slight rotations (1–3°), overlapping elements, cutouts that break the headline's bounding box. Perfect alignment reads as sterile. |
| **Speak like a letter** | Copy is second-person, conversational, and emotionally direct. The notebook slides literally look handwritten to *you*. |

---

## 2. Color

### Core palette

| Token | Hex | Role |
|---|---|---|
| `--ink-black` | `#17140F` | Chips, buttons, deepest shadows, poster type shadows |
| `--espresso` | `#4A4238` | Poster slide background (always with grain texture) |
| `--espresso-deep` | `#332C24` | Vignette edges of poster background |
| `--paper-cream` | `#E9DFC2` | Notebook slide background |
| `--paper-shadow` | `#D6C9A6` | Notebook paper edge shading / aged spots |
| `--presido-yellow` | `#F2C230` | THE accent. Sticker blocks, highlight bars, doodles |
| `--yellow-deep` | `#D9A81C` | Yellow gradient depth / pressed states |
| `--signal-red` | `#A93226` | Notebook red-ink emphasis, margin line |
| `--chalk-white` | `#FFFFFF` | Display headlines, CTA script |
| `--stone-gray` | `#B7AFA2` | Poster body copy (never pure white for paragraphs) |
| `--ink-brown` | `#3B2F23` | Handwritten text on notebook slides |
| `--rule-pink` | `#D99C8F` | Notebook ruled lines |

### Usage rules

- **Poster slides:** `--espresso` background → `--chalk-white` headline → `--stone-gray`
  body → `--presido-yellow` for exactly one CTA/highlight moment.
- **Notebook slides:** `--paper-cream` background → `--ink-brown` writing →
  `--signal-red` reserved for the single most emotional line.
- Yellow always carries `--ink-black` or `--chalk-white` text on top — never gray.
- Never place yellow on cream (both are warm and light; contrast collapses).

### Photo treatment

Photography is always **black & white, high contrast, slightly lifted blacks**
(matte finish). Color photos are converted before use. The only color on a photo
slide comes from type and yellow accents layered on top.

---

## 3. Typography

Three voices, never more:

| Voice | Font (web equivalents) | Case & styling | Used for |
|---|---|---|---|
| **Shout** | Anton / Archivo Black (condensed ultra-bold grotesque) | UPPERCASE, line-height 0.85, letter-spacing −0.01em | Headlines: "CLARITY CALLS", "CREATIVE WRITING" |
| **Explain** | Poppins Light / Montserrat Light (300) | Sentence case, line-height 1.45 | Body paragraphs on poster slides |
| **Whisper** | Caveat / Shadows Into Light (handwritten script) | lowercase, loose, line-height 1.7 | Everything on notebook slides |

### Supporting styles

- **Label / small caps:** Poppins SemiBold, UPPERCASE, letter-spacing 0.12em, 12–14px
  equivalent. Used for names ("JOEL OOREOFE"), roles ("OG PRESIDO"), photo credits
  ("COLLINSBRIGHT"), and button text ("LINK IN BIO", "SHOOT ME A DM").
- **CTA script:** Poppins Bold, sentence case with an exclamation ("Book a call!").
  Always white on yellow.
- **Chip text:** Poppins Bold white on `--ink-black` chip ("& Strategy").

### Scale (1080×1350 canvas)

| Style | Size | Weight |
|---|---|---|
| Display headline | 150–220px | 900 / Anton |
| CTA script | 64–80px | 700 |
| Handwriting (notebook) | 48–64px | Caveat 600 |
| Body copy | 30–36px | 300 |
| Labels / small caps | 20–24px | 600 |

### Type behaviors

- Headlines may be **overlapped by collage cutouts** (the phone hangs over "CALLS",
  the pen crosses "CREATIVE"). Cutouts sit *above* type.
- Headlines can be **partially underlaid with a yellow highlight bar** (see
  "WRITING") — bar sits behind the type, roughly torn/offset, not pixel-aligned.
- Handwritten emphasis uses **hand-drawn underlines** (single or scribbled double),
  never bold or italic toggles.

---

## 4. Layout & Grid

- **Canvas:** 1080 × 1350 (4:5 portrait) for feed carousels. Safe margins 72px.
- **Poster slide anatomy** (top → bottom):
  1. Headline block — starts in the top third, bleeds toward edges
  2. Collage cutout — overlapping the headline, dropping into the middle
  3. Body paragraph — left-aligned, max-width ~60% of canvas
  4. CTA sticker / button — lower third, slightly rotated
  5. Credit block — bottom corner (avatar + name + role)
- **Notebook slide anatomy:**
  1. `@handle` top-left in handwriting
  2. Generous top whitespace (paper should breathe)
  3. Writing block starting ~25% down, left margin aligned just right of the red rule
  4. Optional sticker (balloon, confetti) top-right
- **Rotation:** stickers, chips, and cutouts get 1–3° tilt. Type blocks stay level.
- **Carousel rhythm:** open with a poster slide (hook), move through notebook slides
  (story), close with a poster CTA slide.

---

## 5. Texture & Collage Motifs

These are the fingerprint of the brand — use at least two per slide:

| Motif | Spec |
|---|---|
| **Grain** | Fine monochrome noise at 8–12% opacity over every poster background |
| **Vignette** | Radial darkening toward edges (`--espresso-deep`), keeps focus center |
| **Halftone cutout** | Object photo (phone, pen, props) with visible halftone dot edge / rough white outline, as if scissor-cut from newsprint |
| **Torn / sticker edge** | Yellow CTA block has a rough torn or dashed "cut-out" border, not a clean rectangle |
| **Dashed border** | 2–3px dashed line, used on the yellow sticker outline and ghost pill buttons |
| **Doodles** | Hand-drawn yellow lightning bolts, sparks, scribble underlines — small, near the collage object |
| **Notebook paper** | Ruled lines (`--rule-pink`) every ~64px, red margin line at ~12% from left, punched-hole dots down the left edge |
| **Stickers** | Photographic cutouts (balloon, confetti) placed like scrapbook stickers with a soft drop shadow |

---

## 6. Components

### 6.1 Headline stack (poster)
Two-line uppercase display headline, white, line-height 0.85, optionally with a
subordinate black **chip** attached ("& Strategy") and a collage cutout overlapping
the second line.

### 6.2 Yellow CTA sticker
- Background `--presido-yellow`, torn/dashed edge, 1–2° rotation
- Line 1: CTA script, white, bold ("Book a call!")
- Line 2: small caps label, `--ink-black` ("LINK IN BIO")
- One per slide, maximum.

### 6.3 Ghost pill button
- Transparent dark fill (black at ~35%), 2px dashed `--chalk-white` border,
  fully rounded ends
- Small caps label, white ("SHOOT ME A DM")
- Used on photo slides where a solid yellow block would fight the image.

### 6.4 Chip / tag
- `--ink-black` rounded rectangle, white bold text, slight rotation
- Attaches to headlines as a qualifier ("& Strategy").

### 6.5 Credit block
- Circular avatar (48–64px) + name in small caps white + role in small caps
  `--stone-gray` beneath
- Bottom-left or bottom-right corner, never centered.

### 6.6 Notebook quote box
- Hand-drawn rectangle outline (`--ink-brown`, slightly wobbly corners) around the
  key statement. One box per slide maximum.

### 6.7 Red-ink line
- The single most emotional sentence on a notebook slide, set in `--signal-red`
  with a scribbled double underline.

### 6.8 Carousel chrome
- Prev/next arrows: small gray circles with white chevrons at vertical center edges
- Progress dots along the bottom on notebook slides.

---

## 7. Voice & Copy

- **Person:** always second person — "you", "your gift", "I help you…"
- **Poster body copy pattern:** *who it's for → what it does → what they walk away
  with* ("I help creatives, creators, and personal brands gain clarity… equip you
  with actionable guidance for growth and execution.")
- **Notebook copy pattern:** letter cadence — congratulate, then challenge with
  questions ("Would you still create, without the noise?"), land the red-ink line
  ("Would you have the courage to start over again?")
- **CTAs:** short, warm imperatives with an exclamation: "Book a call!",
  "Shoot me a DM".
- Emphasis via underline, red ink, or CAPITALIZED single words ("CHEERING") — never
  emoji-stacking, never more than one device per sentence.

---

## 8. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Let cutouts overlap and clip headlines | Center-align body paragraphs on posters |
| Keep yellow to one moment per slide | Use yellow AND red loudly on the same slide |
| Rotate stickers/chips 1–3° | Rotate headlines |
| Convert all photos to matte B&W | Use color photography |
| Write body copy in `--stone-gray` | Set paragraphs in pure white (too harsh) |
| Use dashed borders for anything "cut out" | Use drop-shadowed default buttons |
| Leave breathing room on notebook slides | Fill notebook paper edge-to-edge with text |

---

## 9. Implementation files

- [`tokens.css`](./tokens.css) — all colors, type, spacing as CSS custom properties
- [`index.html`](./index.html) — living style guide: palette, type specimens, and
  working recreations of the poster slide, notebook slide, and every component

Web fonts (free equivalents of the observed type):
[Anton](https://fonts.google.com/specimen/Anton),
[Poppins](https://fonts.google.com/specimen/Poppins),
[Caveat](https://fonts.google.com/specimen/Caveat).
