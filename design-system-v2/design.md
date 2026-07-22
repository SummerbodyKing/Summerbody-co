# RISO PRESS — Design System v2

**"Riso Press"** — a vintage print-shop / risograph carousel system, extracted from the
reference set (the "SOUL file" 8-slide carousel style).

Every slide pretends to be a page pulled off a 1970s print-shop press: two inks only
(burnt orange + near-black) on cheap cream stock, over-inked condensed wood-type
headlines, typewriter body copy, job numbers, page counters, and hand-struck ✗/✓ marks.
Nothing glossy. Nothing gradient. If it couldn't be printed with two ink drums, it
doesn't belong.

> v1 ("Scrapbook Editorial", `../design-system/`) is set aside, not deleted.
> The two systems share nothing — do not mix tokens between them.

---

## 1. The Metaphor (why every rule exists)

Treat the carousel as a **print job**, not a social post:

- The account is the **print shop**. Every carousel gets a **job number**
  (`CCC NO. 03 / 05_27_26` → series abbreviation, issue number, date as `MM_DD_YY`).
- Slides are **pages**: numbered `02 / 08`, finished with a directional arrow like a
  proof-sheet "continue" mark.
- There are only **two inks + the paper**. Emphasis comes from flooding a page with
  the orange ink (inverted slide), never from adding a color.
- Type is **over-inked**: heavy, slightly distressed, edges eaten by the paper.
- The voice is **typeset by a human on a typewriter**: ALL CAPS fragments, a period
  after every line, no fluff.

If a design decision breaks the metaphor (a gradient, a drop shadow, a rounded
button, an emoji), it's wrong.

---

## 2. Color — "Two Inks, One Stock"

| Token | Hex | Print role | Usage |
|---|---|---|---|
| `--stock-cream` | `#EFE5CF` | The paper | Default slide background |
| `--stock-aged` | `#E3D5B6` | Aged paper edge | Subtle vignette / texture tint only |
| `--ink-orange` | `#C14E2B` | Ink drum 1 | Flood backgrounds, rules, accents, arrows |
| `--ink-orange-heavy` | `#A8401F` | Double-pass orange | Texture depth on orange floods, pressed states |
| `--ink-black` | `#2A241D` | Ink drum 2 | Headlines, body copy, marks on cream |
| `--ink-black-soft` | `#4A4238` | Under-inked black | Secondary text, captions, misprint offset |

### Hard rules

1. **Cream pages:** black type, orange used only for the kicker rule, marks, and
   at most one accent word.
2. **Orange pages (floods):** *everything* on them is cream. No black on orange —
   the metaphor is one ink drum printing on colored stock.
3. Roughly **1 orange flood per 3 cream pages**. Floods mark narrative turns
   (the promise, the payoff) — see §7.
4. No third color, no tints below 100% except in texture overlays, no pure white
   (`#FFFFFF` is forbidden — the paper is cream), no pure black.

### Contrast (verified)

- `--ink-black` on `--stock-cream`: ~10.9:1 ✅
- `--stock-cream` on `--ink-orange`: ~4.2:1 ✅ (large text — which is all this system uses)

---

## 3. Typography — "Wood Type + Typewriter"

Two families only. No italics anywhere in the system.

| Voice | Font (free web equivalents) | Styling | Role |
|---|---|---|---|
| **PRESS** | Oswald 700 (condensed grotesque); Anton for the single cover word | UPPERCASE, line-height 1.0, letter-spacing 0 | Headlines, cover word, step numbers |
| **TYPE** | Courier Prime / Space Mono (typewriter mono) | UPPERCASE for lists & footers, sentence case allowed for long paragraphs, line-height 1.6, letter-spacing 0.02em | Body copy, lists, serials, counters, labels |

### Scale (1080 × 1350 canvas)

| Style | Size | Font | Notes |
|---|---|---|---|
| Cover word | 380–460px | Anton | One word, fills ≥ 90% of panel width, distressed |
| Headline | 105–130px | Oswald 700 | 2–3 lines max, each line ends with a period |
| Step number | 200–260px | Oswald 700 | "STEP 3." — the number IS the layout |
| Body / list | 40–48px | Courier Prime | The workhorse |
| Footer line | 34–40px | Courier Prime | Centered summary pairs |
| Serial / counter | 26–32px | Courier Prime | `CCC NO. 03 / 05_27_26`, `02 / 08` |
| Vertical ticker | 20–24px | Courier Prime | tracking 0.2em |

### Type behaviors

- **Every fragment ends with a period.** Headlines, list items, footers — the period
  is the brand's punctuation stamp. ("CLAUDE FORGETS EVERYTHING." / "YOUR TONE.")
- **Distress belongs to display type only.** The cover word and headlines may show
  ink erosion (grain mask, 4–8% loss). Typewriter text stays clean — it was typed,
  not pressed.
- Headlines never exceed **3 lines** and never share a page with more than ~14 words
  of body copy.
- Numbers are typeset with the same weight as words — "STEP 3." at poster scale is a
  legitimate full-page composition.

---

## 4. Layout & Grid

- **Canvas:** 1080 × 1350 (4:5). **Margins: 80px** all sides. Content column = 920px.
- **Vertical zones:**

  | Zone | Y-range | Contents |
  |---|---|---|
  | Head | 80–460px | Headline block + kicker rule |
  | Body | 460–1080px | List / paragraph / step content |
  | Footer | 1080–1270px | Footer line, then counter (left) + arrow (right) |

- **Alignment:** headlines and lists are **left-aligned** on cover/step pages,
  **centered** on flood (orange) pages and summary pages. Never justified.
- **The kicker rule:** a `96 × 10px` bar in the opposite ink, placed 32px under the
  headline, aligned to its left edge (centered when the headline is centered).
- **Whitespace is the luxury.** Body zone should be ≤ 60% filled. A page with one
  sentence and a counter is a good page.
- **No rotation of type.** The only rotated element is the vertical ticker rail
  (90° exactly). Distress supplies the "imperfection" — geometry stays square.
  (This is the sharpest difference from v1, which tilted everything.)

---

## 5. Texture Recipes

Applied as overlays; each has a CSS starting point in `tokens.css`.

| Texture | Where | Recipe |
|---|---|---|
| **Paper grain** | Every page | Monochrome noise, 5–8% opacity, multiply |
| **Ink erosion** | Display type only | Noise mask on the glyphs, eating 4–8% of edges; heavier at stroke ends |
| **Roller streak** | Cover word, floods | 1–2 vertical soft bands where ink looks thinner (lighter by ~6%) |
| **Misprint offset** | Optional, ≤ 1 per carousel | Duplicate headline in `--ink-black-soft`, offset 3–5px, behind the true pass |
| **Edge burn** | Flood pages | `--ink-orange-heavy` creeping 40–80px in from 1–2 edges |

Never apply blur, bevel, outer glow, or drop shadows — those are screen effects,
not press effects.

---

## 6. Components

### 6.1 Cover split panel
Orange panel occupying the left ~64% of the page, cream rail on the right carrying
the vertical ticker. The cover word sits on the orange, overflowing onto the rail by
one letter-width. Below the fold: shop name (letterspaced mono, left) + typewriter
hook paragraph (right) + arrow + serial line at the very bottom.

### 6.2 Vertical ticker rail
Repeating keyword chain in mono caps, rotated 90°, running the full page height:
`SOUL. JOB. KEYS. SOUL. JOB. KEYS.` — 3 words from the carousel's topic, repeated.
Separator is the period. One rail per carousel, cover only.

### 6.3 Headline block
2–3 lines of Oswald 700 caps, line-height 1.0, each line ending with a period, with
the kicker rule beneath. On cream: black type, orange rule. On orange: cream type,
cream rule.

### 6.4 Strike list (✗)
3 items max. Hand-struck X (two rough strokes, `--ink-black`, ~1.2em) + mono caps
item ending with a period. Row gap ≥ 1.4em. Used for the *problem* page.

### 6.5 Check list (✓)
Same geometry with rough single-stroke checks. On flood pages the marks are cream.
Used for the *payoff* page. A carousel needs both lists — the ✗ page and the ✓ page
mirror each other (same rhythm, opposite ink).

### 6.6 Step page
`STEP N.` at poster scale, kicker rule, then 1–3 short mono sentences, each on its
own line with blank-line gaps (typewriter paragraph spacing).

### 6.7 Footer line
A two-sentence mono summary, centered, sitting above the counter zone:
`EVERY NEW SESSION. START FROM SCRATCH.` — call-and-response cadence.

### 6.8 Page counter
`NN / NN` mono, bottom-left, `--ink-black-soft` on cream / cream on orange.
Zero-padded. Present on every page except the cover (cover carries the serial line
instead).

### 6.9 Directional arrow
Solid, geometric, heavy (≈ 170 × 60px), bottom-right, pointing right. Black on
cream, cream on orange. It is a printed mark, not a UI chevron — no line-art arrows.

### 6.10 Serial line
`{SHOP} NO. {issue} / {MM_DD_YY}` in mono caps, bottom of cover. Underscores, not
slashes, inside the date.

---

## 7. The 8-Page Narrative System

The layout system is also a **story system**. Default carousel = 8 pages:

| Page | Stock | Template | Job |
|---|---|---|---|
| 01 | Cover split | §6.1 | Hook — one word + one problem sentence |
| 02 | Cream | Headline + strike list | The problem, made painful |
| 03 | **Orange flood** | Centered headline + footer line | The promise ("IT JUST WORKS.") |
| 04 | Cream | Step page | STEP 1. |
| 05 | Cream | Step page | STEP 2. |
| 06 | Cream | Step page | STEP 3. |
| 07 | **Orange flood** | Centered headline + check list | The payoff — mirrors page 02 |
| 08 | Cream | Headline + footer + serial | CTA — comment keyword / link |

Rhythm: cream-cream-ORANGE-cream-cream-cream-ORANGE-cream. The floods land on the
emotional beats. Shorter carousels keep the shape (hook → problem → flood promise →
steps → flood payoff → CTA) and drop step pages.

---

## 8. Voice & Copy

- **ALL CAPS. Short fragments. Period after every one.** Max ~6 words per line.
- Second person, zero hedging: "YOUR TONE. YOUR STYLE. YOUR RULES."
- **Call-and-response pairs** for footers: statement, consequence.
  ("WRITE IT ONCE. USE IT FOREVER.")
- Problem pages use possessive repetition (`YOUR X.` × 3); payoff pages use negation
  repetition (`NO X.` × 3). The mirror is intentional.
- Numbers do the organizing: steps, counts, serials. Never "a few ways" — always
  "3 STEPS."
- Banned: emoji, exclamation marks, ellipses, hashtags inside the art, italics,
  underlined links.

---

## 9. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Two inks + cream, always | Introduce a third color or a gradient |
| End every fragment with a period | Use exclamation marks or emoji |
| Distress the display type | Distress the typewriter text |
| Flood a page orange for emphasis | Put black type on orange |
| Leave the body zone ≥ 40% empty | Fill a page edge-to-edge with copy |
| Keep type square to the grid | Tilt or rotate type (ticker rail excepted) |
| Use solid geometric arrows | Use line-art chevrons or UI icons |
| Zero-pad counters (`02 / 08`) | Write "page 2 of 8" |

---

## 10. Implementation files

- [`tokens.css`](./tokens.css) — the two inks, stock, type scale, zones, and every
  component as a CSS class (`.page`, `.page--flood`, `.headline`, `.kicker-rule`,
  `.list-strike`, `.list-check`, `.arrow-mark`, `.counter`, `.serial`, `.ticker-rail`)
- [`index.html`](./index.html) — living style guide: inks, type specimens, texture
  demos, and working recreations of the cover, problem, flood, step, and payoff pages

Web fonts: [Oswald](https://fonts.google.com/specimen/Oswald) 500/700,
[Anton](https://fonts.google.com/specimen/Anton),
[Courier Prime](https://fonts.google.com/specimen/Courier+Prime) 400/700.
