# 👑 KINGsjobs

A polite, legal job-posting monitor for **Windows 11**. It checks employer
career pages on a schedule, detects brand-new openings, filters them by your
keywords + locations, and **pings your phone instantly** so you can be first to
apply. It also powers the **KINGsjobs web dashboard**.

It is deliberately well-behaved: it reads `robots.txt`, sends an honest
User-Agent, never polls faster than every 15 minutes, backs off on errors, and
**refuses LinkedIn / Indeed / Glassdoor** (their terms forbid this).

---

## What's being watched (your setup)

| Employer | How it's read | Notes |
|---|---|---|
| **ModMed** | Workday official JSON feed | Watches the **whole** careers board, not one job |
| **AP Companies** | isolvedHire listing | Verify on first `--test` |

Filters: keywords (`marketing`, `communications`, `content`, `social media manager`,
`digital strategist`, `brand manager`, `customer success`, …) and locations
(`remote` + Boca Raton, Delray Beach, Boynton Beach, Lake Worth, Pompano).
Change any of this in **`config.yaml`**.

> ⚠️ The jobs you sent (e.g. the **Demand Generation Specialist**) are already
> posted **right now** — apply to those today. KINGsjobs alerts you to *future*
> openings.

---

## One-time setup (about 10 minutes)

### 1. Install Python
Download Python 3 from <https://python.org/downloads> and **check "Add Python to
PATH"** during install.

### 2. Open this folder in a terminal
Open the `kingsjobs` folder, click the address bar, type `cmd`, press Enter.

### 3. Create a virtual environment and install dependencies
```bat
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set up phone alerts (ntfy — free, no account)
1. Install the **ntfy** app (App Store / Google Play).
2. Open it, tap **+**, and subscribe to the topic in `config.yaml`
   (`ntfy_topic:` — currently `kingsjobs-sb2k-a7q3mn`).
3. Want a different name? Change it in `config.yaml` and subscribe to the new
   name in the app. Keep it private — anyone who knows it can see your alerts.

### 5. Test the whole pipe
```bat
python monitor.py --test
```
You should get a **test push on your phone**, and the terminal prints every
matching job it can currently see. (No per-job alerts fire on the first run —
that's the baseline, so you aren't flooded.)

---

## Run it automatically (survives reboots)

Right-click **`setup_task.bat`** → **Run as administrator**. This registers two
Windows scheduled tasks:
- **KINGsjobs Monitor** — runs every 20 minutes.
- **KINGsjobs Monitor (startup)** — runs once at every boot.

That's it. New matching jobs now ping your phone within one interval, and it
keeps running after restarts. To remove it later:
```bat
schtasks /Delete /TN "KINGsjobs Monitor" /F
schtasks /Delete /TN "KINGsjobs Monitor (startup)" /F
```

**Prefer to keep a window open instead?** Run `python monitor.py --loop`.

---

## How alerts behave (so you trust it)
- **First run per site = baseline.** Records what's already there, alerts nothing.
- **Later runs** alert **once** per genuinely new job — never duplicates (it
  remembers what it has seen in `data/seen_*.json`).
- **If a site breaks or changes**, it logs the error, keeps running, and sends
  **one** warning (not a flood). It auto-clears the warning when the site recovers.

---

## Add or remove a site
Edit `config.yaml` → `targets:`. Example:
```yaml
targets:
  - name: ModMed
    url: https://modmed.wd501.myworkdayjobs.com/en-US/ModMed12
  - name: CityOfHollywood
    url: https://www.governmentjobs.com/careers/hollywoodfl
```
Use the **careers listing page** (all jobs), not a single posting. Auto-detected
sources, in priority order: Greenhouse / Lever / **Workday** / **isolvedHire** →
RSS/Atom feed → plain HTML.

> **Indeed / LinkedIn / Glassdoor are refused by design.** If you want a job you
> found there, open its real employer's careers page and add *that* instead.

---

## The KINGsjobs web dashboard
The branded page lives in `web/`. Every run writes `web/data/jobs.json`, which the
page reads.
- **See it locally:** open `web/index.html` in your browser.
- **Live on the web:** it's hosted on its own Netlify site (your Summerbody site
  is untouched). To keep the live page auto-syncing with each check, fill in the
  `netlify:` section of `config.yaml` (`enabled: true`, your `site_id`, and a
  token from app.netlify.com → User settings → Applications).

---

## Optional bits
- **Email instead of / alongside push:** set `email.enabled: true` in
  `config.yaml` and fill in SMTP details (use an *app password*).
- **JavaScript-rendered pages:** if a site returns no jobs, install Playwright
  (`pip install playwright && playwright install chromium`) and tell me — that
  target needs the headless-browser path enabled.

---

## Troubleshooting
- **No test push?** Re-check the topic name matches exactly between `config.yaml`
  and the ntfy app.
- **A site shows 0 jobs in `--test`?** It may be JS-rendered (see above) or its
  layout changed. Check `logs/monitor.log`.
- **Logs:** `logs/monitor.log` (auto-rotates).
