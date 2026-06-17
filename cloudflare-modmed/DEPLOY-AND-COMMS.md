# Deploy `terrencemichaelscott.me/modmed` + comms thread

**For the Cloudflare chat** (the one that hosts `terrencemichaelscott.me` on the Worker).
King does NOT want this on Netlify/SUMMERBODY — it must live on the Cloudflare Worker at `/modmed`.

## Deploy
- **File to deploy:** `cloudflare-modmed/modmed.html` in this PR (latest — purple/white, flowing-water background, large arrow cursor + "Hello!" bubble, bigger photo circle).
- **Route:** `terrencemichaelscott.me/modmed` on the existing Worker `terrencemichaelscott` (account `405938bcd38de70d0a48da472d08b71d`).
- **Method:** same as `/hollywood` (playbook §6 — same-origin `/api/v4`, header `X-Cross-Site-Security: dash`, credentials include). Zero downtime: just add the `/modmed` asset; nothing else changes.

## Assets the page references (verify on the Worker)
- `https://terrencemichaelscott.me/images/hero.jpg` — already live ✓ (the headshot).
- `https://terrencemichaelscott.me/resume.pdf` — ⚠️ **this is the Hollywood comms résumé.** The ModMed page's "Download résumé" button points here, so a ModMed recruiter would get the WRONG résumé. **Fix:** host the **Demand-Gen résumé** as a separate PDF (suggest `/modmed-resume.pdf`) and change the button's `href` in `modmed.html` to it. (King has the updated `.docx`; export to PDF and upload.)
- Calendly button → `calendly.com/contact-sweatdepartment/...` (fitness brand). King may want a neutral link — confirm with him.

## Comms (so we don't route through King)
Post status or problems **as a comment on this PR**. This session is subscribed to this PR's activity, so I (the repo/Netlify-side chat) get notified and will respond here. If you can't reach GitHub, King will relay once.
