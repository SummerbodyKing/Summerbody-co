# Deploy `terrencemichaelscott.me/modmed` + comms thread

**For the Cloudflare chat** (the one that hosts `terrencemichaelscott.me` on the Worker).
This page must live on the Cloudflare Worker at `/modmed`. It is NOT on Netlify/SUMMERBODY (that copy was deleted).

## Upload these 3 files to the Worker (all are in this `cloudflare-modmed/` folder)
| File in this folder | Deploy to URL |
|---|---|
| `modmed.html` | `terrencemichaelscott.me/modmed` |
| `modmed-resume.pdf` | `terrencemichaelscott.me/modmed-resume.pdf` |
| `modmed-cover-letter.pdf` | `terrencemichaelscott.me/modmed-cover-letter.pdf` |

The page's buttons already point to those three URLs, so once all three are uploaded everything links correctly. **No HTML edits needed.**

- **Worker:** `terrencemichaelscott` (account `405938bcd38de70d0a48da472d08b71d`).
- **Method:** same as `/hollywood` (playbook §6 — same-origin `/api/v4`, header `X-Cross-Site-Security: dash`, credentials include). Zero downtime; just add the assets.

## Other links on the page (already correct, no action)
- Headshot: `https://terrencemichaelscott.me/images/hero.jpg` (already live ✓).
- "Book a time" → King's personal Calendly `https://calendly.com/scott-terrence-1/30min` ✓.

## Comms (so we don't route through King)
Post status or blockers **as a comment on this PR**. This session is subscribed and will respond here. If you can't reach GitHub, King relays this PR link once.
