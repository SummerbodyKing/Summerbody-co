# RISO PRESS × Higgsfield — Carousel Generation Playbook

How to get Claude to produce a finished Riso Press carousel with Higgsfield's
image tools. This file is the bridge between the design spec
([`design.md`](./design.md)) and the `generate_image` tool: Claude reads both,
fills the templates below, and runs the job.

---

## 1. How to kick off a carousel (what you say)

Open a Claude session with the **Higgsfield connector enabled** and this repo
attached, then say something like:

> Read `design-system-v2/design.md` and `design-system-v2/higgsfield-playbook.md`,
> then create an 8-slide Riso Press carousel about **[YOUR TOPIC]**.
> Cover word: **[ONE WORD]**. Serial: **[SHOP] NO. [NN] / [MM_DD_YY]**.

That's all Claude needs. It will:

1. Write the copy first (8 pages, following §7 of design.md and the voice rules in §8 — copy is approved before any image is generated).
2. Fill the prompt templates in §4 below, one per page.
3. Call `generate_image` per page with the settings in §2.
4. Show you each slide; regenerate any page where the text is misspelled (see QA, §5).
5. Upscale finals to 2K for export.

---

## 2. Model settings (don't improvise these)

**Primary: `recraft_v4_1`** — the only strong-typography model with native 4:5
AND an enforced hex palette, which is exactly what a two-ink system needs.

| Setting | Value |
|---|---|
| `model` | `recraft_v4_1` |
| `aspect_ratio` | `4:5` |
| `model_type` | `standard` (use `vector` if a page is pure type and standard output looks mushy) |
| `colors` | `["#C14E2B", "#2A241D", "#EFE5CF", "#A8401F", "#4A4238"]` |
| `background_color` | `#EFE5CF` for cream pages, `#C14E2B` for flood pages (03 & 07) |
| `resolution` | `1k` for drafts, then `upscale_image` the approved finals to 2K |

**Fallback: `openai_hazel`** — best-in-class text rendering. Use it for any page
that Recraft keeps misspelling after 2 retries. It has no 4:5, so generate at
`2:3` and ask for "safe margins; composition must survive a slight crop to 4:5",
then crop/outpaint to 1080×1350.

---

## 3. The master style block (prepended to every page prompt)

> Vintage risograph print poster, flat graphic design, two-ink screenprint on
> cream paper stock (#EFE5CF). Only two inks: burnt orange (#C14E2B) and warm
> near-black (#2A241D). Heavy condensed uppercase grotesque wood-type headline
> (style of Oswald Bold / Anton), slightly distressed with subtle ink erosion at
> the letter edges. All secondary text in clean typewriter monospace (style of
> Courier Prime), uppercase. Subtle paper grain across the whole page. Square to
> the grid, generous margins, lots of empty paper. No gradients, no drop
> shadows, no photos, no emoji, no third color, no pure white. 1970s print-shop
> aesthetic. Every text fragment ends with a period.

## 4. Per-page prompt templates

Replace `{...}` slots; keep quoted text EXACTLY as written — quoting the copy is
what makes models spell it correctly. Keep total text per page short: image
models mangle long copy. If a page has more than ~15 words, cut the copy, not
the style.

**Page 01 — Cover** *(background_color `#C14E2B`)*
> {STYLE BLOCK} Cover page: giant distressed cream word "{COVER WORD}" filling a
> burnt orange panel that covers the left two thirds, cream vertical sidebar on
> the right edge with small rotated typewriter text "{WORD1}. {WORD2}. {WORD3}."
> repeating top to bottom. Bottom strip on cream: small letterspaced label
> "{SHOP NAME}", short typewriter sentence "{HOOK SENTENCE}", a solid black
> arrow pointing right, and the serial line "{SERIAL}".

**Page 02 — Problem** *(background_color `#EFE5CF`)*
> {STYLE BLOCK} Cream page, black headline "{PROBLEM HEADLINE}" top left in two
> lines, short orange underline bar beneath it. Below, a list of three lines in
> typewriter monospace, each preceded by a rough hand-drawn black X mark:
> "{ITEM 1}." "{ITEM 2}." "{ITEM 3}." Centered typewriter footer near the
> bottom: "{FOOTER LINE A}. {FOOTER LINE B}." Bottom left small page number
> "02 / 08", bottom right a solid black arrow pointing right.

**Page 03 — Promise (orange flood)** *(background_color `#C14E2B`)*
> {STYLE BLOCK} Full burnt orange page, everything printed in cream ink only.
> Centered cream headline "{PROMISE HEADLINE}" in two lines, short cream
> underline bar, centered typewriter line "{PAYOFF PAIR A}. {PAYOFF PAIR B}."
> Bottom left "03 / 08", bottom right solid cream arrow pointing right. Slightly
> heavier orange at the page edges like double-passed ink.

**Pages 04–06 — Steps** *(background_color `#EFE5CF`)*
> {STYLE BLOCK} Cream page, giant black headline "STEP {N}." top left, short
> orange underline bar. Below, {1–3} short typewriter sentences with blank-line
> gaps between them: "{SENTENCE 1}." "{SENTENCE 2}." "{SENTENCE 3}." Bottom left
> "0{N+3} / 08", bottom right solid black arrow pointing right. Mostly empty
> paper.

**Page 07 — Payoff (orange flood)** *(background_color `#C14E2B`)*
> {STYLE BLOCK} Full burnt orange page, cream ink only. Centered cream headline
> "{PAYOFF HEADLINE}" in two or three lines, short cream underline bar, then
> three typewriter lines each preceded by a rough cream check mark: "{ITEM 1}."
> "{ITEM 2}." "{ITEM 3}." Bottom left "07 / 08", bottom right solid cream arrow.

**Page 08 — CTA** *(background_color `#EFE5CF`)*
> {STYLE BLOCK} Cream page, black headline "{CTA HEADLINE}" top left, orange
> underline bar, centered typewriter instruction "{CTA INSTRUCTION}." near the
> middle, serial line "{SERIAL}" at the bottom left, no arrow (last page).

---

## 5. QA checklist (Claude runs this on every generated page)

1. **Spelling** — read every word in the output. Image models misspell; this is
   the #1 failure. Any typo → regenerate (same prompt, or switch that page to
   `openai_hazel`). Never ship a typo'd slide.
2. **Two inks only** — any third color or gradient → regenerate.
3. **No black on orange** — flood pages must be cream-on-orange only.
4. **Period check** — every fragment ends with a period.
5. **Counter check** — page numbers are zero-padded and sequential.
6. Approved pages → `upscale_image` to 2K, then deliver all 8 in order.

---

## 6. When NOT to use Higgsfield (the hybrid option)

Image models approximate typography; they never render it perfectly. For
pixel-perfect slides, this repo already contains the alternative: the pages in
[`index.html`](./index.html) are built from [`tokens.css`](./tokens.css) at true
4:5 — Claude can lay out each slide as HTML/CSS and screenshot it at 1080×1350
with headless Chromium. 

**Rule of thumb:**
- Want speed and a hand-printed, imperfect look → **Higgsfield** (this playbook).
- Want exact fonts and flawless text at any length → **HTML render**.
- Best of both: HTML-render the text-heavy pages, Higgsfield-generate the cover
  art, then combine.
