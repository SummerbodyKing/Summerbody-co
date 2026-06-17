# HANDOFF → the chat that hosts terrencemichaelscott.me (Cloudflare Worker)

You built and host `terrencemichaelscott.me` (Cloudflare Worker `terrencemichaelscott`,
account `405938bcd38de70d0a48da472d08b71d`). I'm the other chat. King approved a plan to
make the **root neutral** and keep job-specific pages at end-URLs. **I built the finished
neutral homepage for you — you don't need to design anything, just deploy the attached
file.** I have no Cloudflare access, so deploying is yours.

## What's decided (King-approved)
- Root `/` must be **job-neutral** (so a recruiter at the bare link can't see which jobs he applied to).
- Approved root headline:
  - **H1:** Strategic Communications & Brand Leader
  - **Tagline:** Fifteen years of brand, marketing, and storytelling that audiences read, watch, share — and act on.
  - **Kicker:** Communications · Brand · Marketing

## Target structure (all on YOUR existing Cloudflare Worker — NO DNS change, NO Netlify)
| Path         | Content |
|--------------|---------|
| `/`          | **NEW neutral homepage** — the attached `index.html` (already finished, deploy as-is) |
| `/hollywood` | the existing Hollywood page (rename `hollywood-page.html` → `hollywood.html`) |
| `/modmed`    | the ModMed page |
| `/reimagined.html` | stays at root (the Hollywood page links to it) |

## The file I built: `index.html` (attached)
- Adapted from your Hollywood design — **identical design system kept**: Fraunces + Inter,
  cream/navy/gold/orange/teal, gold turtle, towel tiles, beach "wash" intro, stat ticker, slow animations.
- **Job-specific content removed** from root: "Why Hollywood", "Serving Hollywood", the
  "What I'd bring to Hollywood / City homepage reimagined" section, and the 90-day plan.
  (Those live only on `/hollywood`.)
- **Neutralized**: hero copy, "How I work" approach section, "Community & impact" section.
- **Asset links are already ABSOLUTE** (`/images/hero.jpg`, `/images/kid.jpg`,
  `/images/community.jpg`, `/images/lassiter.jpg`, `/resume.pdf`) so they resolve at `/`
  with or without a trailing slash.
- Uses the same assets you already have in the bundle — no new assets needed.
- Verified: 25 KB, balanced tags, ends with `</html>`.

## Zero-downtime deploy order (so the live Hollywood page never goes dark)
1. Deploy `/hollywood` FIRST (rename `hollywood-page.html` → `hollywood.html`; switch its
   asset links to absolute: `/images/...`, `/resume.pdf`, `/reimagined.html`).
2. Confirm `terrencemichaelscott.me/hollywood` loads.
3. THEN deploy the attached `index.html` to root `/`.
4. Confirm: root is now the neutral portfolio AND `/hollywood` still works.
5. Add `/modmed` (King's ModMed page) if not already there.

## Notes from your own playbook (carry over)
- Deploy via King's logged-in Chrome on a `dash.cloudflare.com` tab → same-origin `/api/v4`;
  every write needs `X-Cross-Site-Security: dash` + credentials include. (Section 6 of the playbook.)
- Your editor tool truncates files >~30 KB — `index.html` is 25 KB, under the limit, but
  after writing verify it still ends with `</html>` and `<div` count == `</div>` count (currently 90 == 90).

## Not your concern (handled on my side)
- King's **ModMed application (R4527)** does not depend on any of this. Its resume link is
  `summerbodyco.netlify.app/modmed` (separate Netlify site) and works once published.
