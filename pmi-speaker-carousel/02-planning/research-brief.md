# Research Brief — PMISF-SPKR-2026

**Project:** PMI South Florida Rotating Speaker Carousel
**Author:** Research Agent
**Date:** 2026-07-04
**Status:** For Lead PM review
**Covers:** Risk R-2 (font licensing), pop-out head effect, Risk R-4 (programmatic video render), monochromatic brand palettes

---

## 1. Font Licensing — Aptos (Risk R-2)

### What Aptos is
Aptos (originally "Bierstadt") was designed by Steve Matteson and commissioned by Microsoft as the default font replacing Calibri across Microsoft 365. It is a **proprietary, commercially licensed** typeface — it is *not* open source and is *not* on Google Fonts. It ships via the Microsoft 365 cloud font service, and Microsoft also offers a local-install download "for use in applications that do not have access to the Office Font Service" (Microsoft Download Center, v4.40, 2024) — that download page carries no standalone open license; the font remains governed by the Microsoft product license it came with.

### What the license permits
Microsoft's font licensing (product EULA + the Microsoft Typography "Font redistribution FAQ") follows the standard pattern:

- **PERMITTED — rendered/rasterized output.** You may "use this font to create, display, and print content as permitted by the license terms of the Microsoft product... in which this font was included." Microsoft's guidance treats "print" broadly: images, graphics, **videos**, posters, ads, etc. are fine — *as long as the font data itself is not embedded in the output file*. An MP4 contains only rasterized pixels, no font data. **So rendering Aptos text into MP4 videos for the chapter's social media is legally fine**, including commercial use, on any machine covered by a valid Windows / Microsoft 365 license.
- **NOT PERMITTED — web font self-hosting.** Microsoft's font FAQ explicitly states you do **not** have the right to copy fonts from a Windows/Office installation to a web server ("web font self-hosting") or to convert them to WOFF/WOFF2. **Embedding Aptos on a public web page via `@font-face` is not allowed under the Windows/Office license.**
- **Paid path exists:** Monotype sells Aptos desktop and webfont licenses on MyFonts. Webfont licenses are annual and single-domain — overkill for a volunteer nonprofit chapter project.

**Practical implication for this project:** the *rendered MP4s* can legally use Aptos (rendered on a properly licensed Windows/M365 machine — note a headless Linux render box has no Microsoft license and no lawful copy of the font files, which pushes us toward a lookalike anyway). The *live web page/carousel* must not `@font-face` Aptos.

### Open-licensed lookalikes on Google Fonts (all SIL OFL — free for web embed, video, commercial use)
Aptos is a grotesque sans with humanist/geometric warmth. Closest free matches, all on Google Fonts:

1. **Inter** — the most-cited free Aptos substitute; screen-first neo-grotesque with similar proportions and a large weight range; excellent at both display and small sizes.
2. **Schibsted Grotesk** — OFL neo-grotesque designed for digital UI (Bakken & Bæck); closest to Aptos's slightly quirky grotesque character at display sizes.
3. **Open Sans** — humanist sans by **the same designer as Aptos (Steve Matteson)**; shares the humanist DNA, slightly softer/wider than Aptos.

(Also worth a look: **Figtree**, a friendly geometric-humanist sans on Google Fonts.)

### Sources
- Microsoft Typography — Font redistribution FAQ: https://learn.microsoft.com/en-us/typography/fonts/font-faq
- Microsoft Typography — Aptos font page: https://learn.microsoft.com/en-us/typography/font-list/aptos
- Office Watch — "Aptos & Microsoft fonts, what can you legally do with them?": https://office-watch.com/2023/aptos-microsoft-fonts-legally-do/
- Microsoft Q&A — Aptos in a commercial web app: https://learn.microsoft.com/en-us/answers/questions/1657352/can-i-use-the-aptos-font-in-my-commercial-web-app
- Microsoft Q&A — pre-installed fonts in monetized social video: https://learn.microsoft.com/en-us/answers/questions/3781331/legal-permission-to-use-pre-installed-microsoft-fo
- Microsoft Download Center — Aptos fonts: https://www.microsoft.com/en-us/download/details.aspx?id=106087
- MyFonts (Monotype) — Aptos desktop/webfont licensing: https://www.myfonts.com/collections/aptos-font-microsoft-corporation/
- Wikipedia — Aptos (typeface): https://en.wikipedia.org/wiki/Aptos_(typeface)
- Google Fonts specimens: https://fonts.google.com/specimen/Inter , https://fonts.google.com/specimen/Schibsted+Grotesk , https://fonts.google.com/specimen/Open+Sans

**RECOMMENDATION:** Do NOT self-host Aptos via `@font-face` (license violation, Risk R-2 confirmed); use **Inter** (primary) from Google Fonts for both the web carousel and the MP4 renders — one font everywhere, zero licensing risk — with Schibsted Grotesk or Open Sans as approved alternates.

---

## 2. Pop-Out Head Effect

### How designers do it
The universal recipe in social graphics (Canva/Photoshop/Figma): a **background-removed (transparent PNG) headshot** is layered **on top of** a solid shape (usually a circle), sized so the head and shoulders extend past the shape's top edge while the body remains visually "inside" the shape. The illusion comes from z-order + partial clipping, not from any single magic property. In CSS there are three solid ways to reproduce it:

### Technique A — Layered stack: shape behind, oversized PNG in front (simplest, recommended)
The circle is a pseudo-element behind the image; the PNG is taller than the circle so the head "escapes" out the top. The container clips any spill below the circle's bottom edge.

```html
<div class="pop"><img src="speaker-cutout.png" alt="Jane Speaker"></div>
```
```css
.pop {
  position: relative;
  width: 320px;
  height: 400px;               /* taller than circle: headroom for the pop */
  overflow: hidden;             /* clips the PNG at the card bounds */
}
.pop::before {                  /* the circle */
  content: "";
  position: absolute;
  bottom: 0; left: 50%;
  translate: -50% 0;
  width: 320px; height: 320px;
  border-radius: 50%;
  background: var(--brand);
  z-index: 0;
}
.pop img {
  position: absolute;
  bottom: 0; left: 50%;
  translate: -50% 0;
  height: 380px;                /* taller than the 320px circle → head pops out */
  z-index: 1;                   /* above the circle */
}
```
Works because the transparent PNG's shoulders are narrower than the circle, so nothing needs clipping at the sides. Trivially animatable (slide the img up with a transform/keyframe for a "rise out of the circle" entrance).

### Technique B — SVG `<clipPath>` union: circle + head window (precise clipping)
When the photo is wider than the circle at the bottom, clip the image to the union of the circle **plus** a rectangle covering only the head region. Overflow shows only where you allow it (CSS-Tricks "Image Pop-Out Effect with SVG Clip Path").

```html
<svg width="0" height="0" aria-hidden="true">
  <clipPath id="popClip" clipPathUnits="objectBoundingBox">
    <circle cx="0.5" cy="0.66" r="0.34"/>          <!-- the circle body -->
    <rect x="0.28" y="0" width="0.44" height="0.66"/> <!-- head escape window -->
  </clipPath>
</svg>
```
```css
.pop img { clip-path: url(#popClip); }
```
Fully responsive via `objectBoundingBox` units; the shape can be any path (blob, hexagon), not just a circle.

### Technique C — Single-element modern CSS (Temani Afif / CSS-Tricks avatar hover)
One `<img>`, no wrappers: `border-radius: 0 0 999px 999px` rounds only the bottom into a half-circle "bowl", an `outline` + `outline-offset` draws the circle ring, and a `radial-gradient` background fills the disc. On hover, `scale()` the image while the gradient/outline stay fixed — the head appears to jump out.

```css
img.avatar {
  --s: 280px;
  width: var(--s); aspect-ratio: 1;
  padding-top: 40px;                          /* headroom */
  border-radius: 0 0 999px 999px;             /* clip bottom into the circle */
  outline: 6px solid var(--brand);
  outline-offset: -6px;
  background: radial-gradient(circle closest-side,
              var(--brand-tint) 99%, transparent 100%) no-repeat bottom / 100% var(--s);
  transition: scale .3s;
}
img.avatar:hover { scale: 1.12; }
```
Elegant for interactive web use; less flexible for arbitrary compositions than A/B.

### Sources
- CSS-Tricks — "Let's Create an Image Pop-Out Effect With SVG Clip Path": https://css-tricks.com/lets-create-an-image-pop-out-effect-with-svg-clip-path/
- CSS-Tricks — "A Fancy Hover Effect For Your Avatar": https://css-tricks.com/a-fancy-hover-effect-for-your-avatar/
- css-tip.com — "A Fancy Hover Effect For Your Avatar II": https://css-tip.com/avatar-hover-effect-2/
- Medium — "Re-Creating The Pop-Out Hover Effect With Modern CSS": https://er-raj-aryan.medium.com/re-creating-the-pop-out-hover-effect-with-modern-css-part-2-e2ddc835abf7
- CSS-Tricks — clip-path almanac: https://css-tricks.com/almanac/properties/c/clip-path/

**RECOMMENDATION:** Use **Technique A (layered stack: circle pseudo-element behind an oversized transparent-PNG headshot)** as the production approach — it is the simplest, easiest to animate for the video renders, and needs only a background-removed PNG per speaker; keep Technique B (SVG clipPath) in reserve for photos whose shoulders exceed the circle width.

---

## 3. Programmatic Video Render — HTML/CSS/JS → MP4 (Risk R-4)

### The core pattern
All credible pipelines do the same thing: load the page in **headless Chromium**, advance a **virtual/deterministic clock** one frame at a time, screenshot each frame as PNG, and encode with **ffmpeg** (`libx264`, `-pix_fmt yuv420p`). Never record in real time — a headless box drops frames and real-time capture is non-deterministic.

### Tooling landscape
| Tool | What it is | State |
|---|---|---|
| **Playwright/Puppeteer + ffmpeg (DIY)** | ~80-line script: seek animation → `page.screenshot()` per frame → pipe PNGs to `ffmpeg -f image2pipe` | No dependency risk; full control |
| **timecut** (tungs/timecut, npm) | Puppeteer + `timeweb`: monkey-patches `Date`, `performance.now`, `requestAnimationFrame` so JS animations run on virtual time | Works but **last release v0.3.3, April 2022** (stale); **critical gotcha: only virtualizes JS time — pure CSS transitions/animations will NOT render correctly** |
| **Remotion** | React-based programmatic video framework with mature headless rendering (`@remotion/renderer`) | Very actively maintained; **special license — but FREE for non-profits** (and individuals / for-profit teams ≤3), so PMI chapter qualifies |
| html5-animation-video-renderer, HyperFrames/html-video | Same headless-browser + ffmpeg pattern, seekToFrame-style APIs | Niche/newer; same principles |

### Gotchas (frame timing / animation clocking)
1. **Deterministic clocking is the whole game.** Drive animation from a single `t` you control per frame — not wall-clock time. Cleanest non-framework method: build animations with the **Web Animations API or CSS animations paused**, then per frame set `document.getAnimations().forEach(a => a.currentTime = frame * 1000/fps)`. This *does* seek CSS keyframe animations (unlike timecut's approach). GSAP's `seek()` works identically.
2. **CSS animations vs. time-mocking:** tools that patch JS timers (timecut/timeweb) miss CSS-rule-driven animation — either use WAAPI/`currentTime` seeking or keep all motion in JS.
3. **Wait for readiness** before frame 1: `document.fonts.ready`, image `decode()`, and a couple of rAF ticks — otherwise frame 0 shows FOUT/blank images.
4. **Encoding:** 1080×1350 is already even-dimensioned (yuv420p requires even width/height); use `-pix_fmt yuv420p` for Instagram/LinkedIn compatibility, `-crf 18 -preset slow`, 30 fps → 450–600 frames for 15–20 s. Set viewport exactly 1080×1350 with `deviceScaleFactor: 1`.
5. **Headless Linux:** modern headless Chromium needs no Xvfb; keep `--disable-gpu` fallback and pin browser version for reproducible output.

### Sketch of the recommended pipeline
```js
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fps = 30, dur = 18, W = 1080, H = 1350;

const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',String(fps),'-i','-',
  '-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','slow','out.mp4']);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('file:///.../card.html');
await page.evaluate(() => Promise.all([document.fonts.ready]));
await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
for (let f = 0; f < fps * dur; f++) {
  await page.evaluate(t => document.getAnimations().forEach(a => a.currentTime = t), f * 1000 / fps);
  ff.stdin.write(await page.screenshot({ type: 'png' }));
}
ff.stdin.end();
```

### Sources
- timecut (GitHub): https://github.com/tungs/timecut — and npm: https://www.npmjs.com/package/timecut (limitation: "pages where changes occur via other means (e.g. through transitions/animations from CSS rules) will likely not render as intended")
- Remotion license (free for non-profits): https://www.remotion.dev/docs/license and https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- html5-animation-video-renderer (seek-per-frame pattern): https://github.com/dtinth/html5-animation-video-renderer
- HyperFrames / html-video (headless Chromium + ffmpeg libx264 pattern): https://github.com/nexu-io/html-video , https://www.mindstudio.ai/blog/what-is-hyperframes-ai-video-rendering

**RECOMMENDATION:** Build a small **Playwright frame-stepping script** (pause all animations, seek `document.getAnimations()[].currentTime` per frame at 30 fps, pipe PNGs to `ffmpeg -f image2pipe … libx264/yuv420p`) for the 15–20 s 1080×1350 renders — it reuses the exact HTML/CSS of the web carousel, handles CSS animations correctly, and has zero license/maintenance risk; avoid timecut (stale, misses CSS animations) and keep Remotion (free for nonprofits) as the fallback if the DIY script becomes a burden.

---

## 4. Monochromatic Brand Palettes (Sponsor requirement)

### Method (for the Dev Agent)
Standard approach: convert the base hex to **HSL, hold hue (H) and saturation (S) constant, and step lightness (L)** — tints step L toward white (~96%), shades step L toward black. This is how Tailwind-style 100–900 scales and Sass `tint()`/`shade()` behave, and it guarantees every step reads as "the same color, but different." Formula used below (easy to reproduce programmatically):

```
tint-100:  L' = L + (96 − L) × 0.72
tint-300:  L' = L + (96 − L) × 0.38
base-500:  L' = L
shade-700: L' = L × 0.68
shade-900: L' = L × 0.42
```
In CSS this can even be done at runtime with relative color syntax: `hsl(from var(--base) h s calc(l * 0.68))`.

### The ramps (light → dark), computed from the PMI brand hexes

**PMI Violet — base `#4F17AB` (H 263°, S 76%, L 38%)**

| Step | Hex | L |
|---|---|---|
| violet-100 | `#C2A4F3` | 80% |
| violet-300 | `#864BE7` | 60% |
| violet-500 (base) | `#4F17AB` | 38% |
| violet-700 | `#361074` | 26% |
| violet-900 | `#210A48` | 16% |

**PMI Aqua — base `#05BFE0` (H 189°, S 96%, L 45%)**

| Step | Hex | L |
|---|---|---|
| aqua-100 | `#A4F0FD` | 82% |
| aqua-300 | `#4DE1FB` | 64% |
| aqua-500 (base) | `#05BFE0` | 45% |
| aqua-700 | `#038298` | 31% |
| aqua-900 | `#02505E` | 19% |

**PMI Tangerine — base `#FF610F` (H 20°, S 100%, L 53%)**

| Step | Hex | L |
|---|---|---|
| tangerine-100 | `#FFC9AD` | 84% |
| tangerine-300 | `#FF9862` | 69% |
| tangerine-500 (base) | `#FF610F` | 53% |
| tangerine-700 | `#B83F00` | 36% |
| tangerine-900 | `#712700` | 22% |

Usage note: the 100/900 extremes give text-on-background contrast within a single hue (e.g., tangerine-900 text on tangerine-100 panel), which is how a "shades of the same color but different" design stays legible.

**RECOMMENDATION:** Adopt the three 5-step HSL-lightness ramps above as CSS custom properties (`--violet-100 … --violet-900`, etc.), one ramp per speaker card, and have the Dev Agent generate them programmatically with the constant-H/S, stepped-L formula (or CSS relative color syntax) so future brand colors ramp identically.

---

*End of brief. Sources verified via web search/fetch on 2026-07-04. Note: learn.microsoft.com pages were blocked by the sandbox proxy for direct fetch; Microsoft licensing claims were verified via search-indexed excerpts of those pages plus the Office Watch analysis and Microsoft Q&A threads cited above.*
