# Optins Redirect Proposal (NOT APPLIED)
Date: 2026-11-01
Nothing here is in `netlify.toml`. Production redirects are unchanged.

## Current production rules (from netlify.toml on the production branch)
| Route | Current destination | Status code |
|---|---|---|
| /free | kingsummerbody-1.optins.com/the-no-math-meal-blueprint?utm_source=ig_personal&utm_medium=bio | 301, forced |
| /canvasrebel | kingsummerbody-1.optins.com/the-no-math-meal-blueprint?utm_source=canvasrebel&utm_medium=feature&utm_campaign=story2026 | 301, forced |
| /reset | kingsummerbody-1.optins.com/5-day-holiday-reset?utm_source=email&utm_medium=campaign | 301, forced |
| /guide, /call, /purium | working destinations | do not touch |

## Proposed mapping
| Route | Proposed destination | Code | When |
|---|---|---|---|
| /free | /blueprint/?utm_source=ig_personal&utm_medium=bio&utm_campaign=free | 302 | After staging passes and owner approves |
| /canvasrebel | /blueprint/?utm_source=canvasrebel&utm_medium=feature&utm_campaign=story2026 | 302 | Same time as /free |
| /reset | unchanged (Optins) | 301 | Not until a 5-Day Reset replacement is built and tested |

Proposed `netlify.toml` text (do not apply yet):
```
[[redirects]]
  from = "/free"
  to = "/blueprint/?utm_source=ig_personal&utm_medium=bio&utm_campaign=free"
  status = 302
  force = true

[[redirects]]
  from = "/canvasrebel"
  to = "/blueprint/?utm_source=canvasrebel&utm_medium=feature&utm_campaign=story2026"
  status = 302
  force = true
```

## Risks and checks
- The old rules are permanent 301s. Browsers and some link tools cache 301s, so some visitors may keep going to Optins after the change. This cannot be fully undone, so keep the Optins account alive until traffic to it stops.
- Confirm on staging that campaign parameters survive the redirect and reach the hidden form fields.
- The replacement page text was written new. It is not a copy of the Optins page. Compare the promise, the consent language, and the delivered file before switching.
- Export the Optins subscriber list and the consent wording that was shown to them before cancelling the account.
