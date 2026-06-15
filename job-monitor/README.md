# Job-posting monitor

A small, reliable monitor for **Windows 11**. It polls one or more careers
pages on a schedule, detects newly posted jobs, and pushes a notification to
your phone the moment a new one appears — so you can be among the first to
apply.

It is built to be a **polite, legal** monitor:

- reads `robots.txt` and honors it,
- sends a clear, honest `User-Agent`,
- polls no more than once every 15 minutes per site (enforced),
- backs off and warns **once** (not a flood) when a site breaks,
- **refuses** sites whose terms forbid scraping (LinkedIn, Indeed, Glassdoor)
  and points you at the employer's own careers page or an official feed.

---

## What it does

1. **Auto-detects** the best source per URL, in priority order:
   1. **Applicant tracking systems** with a JSON API — Greenhouse, Lever,
      Workday (cxs endpoint), GovernmentJobs/NeoGov (RSS/JSON, common for
      cities & counties).
   2. **RSS / Atom** feeds (auto-discovered from the page when present).
   3. **HTML scraping** with requests + BeautifulSoup; if the page is
      JavaScript-rendered, it falls back to **Playwright** headless Chromium.
2. Extracts a stable list of `job_id, title, location, url, posted_date`.
3. **Baselines** on the first run for each target (records everything,
   notifies nothing — so you aren't flooded).
4. On later runs, notifies **once** per genuinely new job that matches your
   keywords and location filter.

---

## Quick start (Windows 11)

Open **PowerShell** or **Command Prompt** in this `job-monitor` folder.

```bat
REM 1) One-time setup: creates venv, installs deps, makes config.yaml
setup.bat

REM 2) Edit config.yaml — set your ntfy topic and target URLs (see below)
notepad config.yaml

REM 3) Confirm the whole pipe works (prints findings + sends a test push)
run_test.bat
```

If `run_test.bat` sends a push to your phone, you're done with the hard part.

> **Prerequisite:** Python 3 from <https://www.python.org/downloads/>. During
> install, tick **"Add python.exe to PATH"**.

### Manual setup (if you prefer not to use the .bat files)

```bat
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
copy config.example.yaml config.yaml
REM edit config.yaml, then:
python monitor.py --test
```

---

## Getting push notifications on your phone (ntfy.sh — free, no account)

1. Install the **ntfy** app (iOS / Android).
2. In `config.yaml`, set a **secret** topic name under `notify.ntfy.topic`,
   e.g. `sb2k-jobs-7h3kq9`. Anyone who knows the topic can read your alerts,
   so make it long and hard to guess.
3. In the ntfy app, tap **+** and subscribe to that **exact** topic.
4. Run `run_test.bat`. You should get a "Job monitor test OK" push.

Every job notification includes the **title, location, posted date (when
available), and a clickable direct apply URL**.

### Email instead (optional fallback)

Set `notify.channel: email` and fill in the `email:` block (SMTP host, port,
username, app password, from/to). For Gmail you must create an **app
password** — your normal password won't work.

---

## Configuring targets

Edit the `targets:` list in `config.yaml`. Minimal entry:

```yaml
targets:
  - name: hollywood-fl
    url: "https://www.governmentjobs.com/careers/hollywoodfl"
```

- `name` — short label; used for the state file `data/seen_<name>.json` and
  shown in notifications. Keep it unique per target.
- `url`  — the careers page or board URL.
- `type` — optional. Auto-detected by default. Force one of:
  `greenhouse | lever | workday | governmentjobs | rss | html | auto`.
- `enabled` — optional, default `true`. Set `false` to pause a target.

**Add a site:** add another `- name:/url:` block, run `run_test.bat` to
confirm it parses, then let the scheduler pick it up.

**Remove a site:** delete its block (and optionally its
`data/seen_<name>.json` file).

### Forbidden sites

If you point it at LinkedIn, Indeed, or Glassdoor, it will **refuse** and log
a warning. Those sites' terms forbid scraping. Instead, find the employer's
own careers page (often Greenhouse/Lever/Workday) or an official RSS feed and
target that.

---

## Running it on a schedule (Windows Task Scheduler)

You have two run modes:

- **One-shot** (recommended with Task Scheduler): `run_once.bat` — runs a
  single check and exits. The scheduler runs it every N minutes.
- **Continuous**: `run_loop.bat` — stays open and checks on its own timer.

### Create the scheduled tasks

The monitor can print the exact commands for *your* machine and paths:

```bat
venv\Scripts\python monitor.py --print-task
```

That prints two `schtasks` commands. Run them in an **Administrator** Command
Prompt. They create:

1. **JobMonitor** — runs every `check_interval_minutes` (default 20).
2. **JobMonitorStartup** — also runs once at every reboot, so it survives
   restarts.

Equivalent manual recipe (adjust the interval if you changed it):

```bat
schtasks /Create /TN "JobMonitor" /SC MINUTE /MO 20 ^
  /TR "C:\path\to\job-monitor\run_once.bat" /RL LIMITED /F

schtasks /Create /TN "JobMonitorStartup" /SC ONSTART ^
  /TR "C:\path\to\job-monitor\run_once.bat" /RL LIMITED /F
```

> Pointing the task at `run_once.bat` (rather than python directly) keeps the
> command simple and uses the venv automatically.

### Enable / verify / remove

```bat
schtasks /Query  /TN "JobMonitor"          REM verify it exists
schtasks /Run    /TN "JobMonitor"          REM run it now to test
schtasks /Delete /TN "JobMonitor" /F       REM remove
schtasks /Delete /TN "JobMonitorStartup" /F
```

You can also manage these in the **Task Scheduler** GUI (Win → "Task
Scheduler" → Task Scheduler Library → JobMonitor).

> Tip: in the task's properties, tick **"Run whether user is logged on or
> not"** so it keeps checking when you're away, and **"Run task as soon as
> possible after a scheduled start is missed"** to recover after sleep.

---

## Command reference

```bat
python monitor.py                 # one-shot check (Task Scheduler uses this)
python monitor.py --loop          # run forever, sleeping CHECK_INTERVAL
python monitor.py --test          # one pass; print findings + send test push
python monitor.py --print-task    # print schtasks commands for this machine
python monitor.py --config X.yaml # use a different config file
python monitor.py --quiet         # less console output
```

---

## How dedupe & state work

- State lives in `data/seen_<name>.json` per target.
- **First run** records all current matching jobs as a baseline and sends **no**
  notifications.
- After that, a job is "new" only if its `job_id` isn't already in state, so
  you get **exactly one** alert per new job, even across reboots.
- `job_id` comes from the source when available (Greenhouse/Lever ids, feed
  GUIDs); otherwise it's a hash of `title + url`.
- Logs roll in `logs/monitor.log` (rotating, 5 files).

To re-baseline a target (e.g. after changing filters), delete its
`data/seen_<name>.json` — the next run becomes a fresh baseline.

---

## Error handling

- If a site is unreachable or its structure changed, it's **logged**, the
  monitor keeps going with other targets, and you get **one** warning push.
  No repeat warnings until that site recovers.
- `robots.txt` disallows are respected and logged (no notification spam).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No test push | Check `notify.ntfy.topic` matches the topic you subscribed to in the app. Re-run `run_test.bat` and read `logs/monitor.log`. |
| `found=0` for a site | The HTML scraper is generic; the site may need an explicit `type:` or may be JS-rendered. Install Playwright (`playwright install chromium`) or find the site's Greenhouse/Lever/feed URL. |
| Playwright errors | Run `playwright install chromium` inside the venv. Optional — only JS pages need it. |
| Gmail SMTP fails | Use an **app password**, not your account password. |
| Too-frequent polling warning | The 15-minute floor is enforced; raise `check_interval_minutes`. |

---

## Files

```
job-monitor/
  monitor.py            # the program
  config.example.yaml   # template — copy to config.yaml and edit
  config.yaml           # YOUR settings (gitignored)
  requirements.txt
  setup.bat             # one-time: venv + deps + config.yaml
  run_test.bat          # --test
  run_once.bat          # single check (Task Scheduler target)
  run_loop.bat          # continuous mode
  data/                 # per-target state (gitignored)
  logs/                 # rolling logs (gitignored)
```
