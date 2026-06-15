#!/usr/bin/env python3
"""
Job-posting monitor.

Polls one or more careers pages / job boards on a schedule, detects newly
posted jobs, and pushes a notification the moment a new one appears.

Design goals: reliability over cleverness, and being a polite, legal monitor
(robots.txt aware, clear User-Agent, rate limited, backs off on errors).

Usage:
    python monitor.py                 # one-shot (for Windows Task Scheduler)
    python monitor.py --loop          # run forever, sleeping CHECK_INTERVAL
    python monitor.py --test          # one run, print findings, send a test push
    python monitor.py --print-task    # print the exact schtasks command for this machine
    python monitor.py --config other.yaml

See README.md for setup and Task Scheduler instructions.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import logging.handlers
import os
import re
import smtplib
import sys
import time
import urllib.parse
import urllib.robotparser
from datetime import datetime, timezone
from email.mime.text import MIMEText
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Missing dependency 'requests'. Run: pip install -r requirements.txt")

try:
    import yaml
except ImportError:
    sys.exit("Missing dependency 'PyYAML'. Run: pip install -r requirements.txt")

# Optional dependencies — imported lazily where used so the tool still runs
# without them (with reduced capability and a clear log message).
#   - bs4 (BeautifulSoup)  : HTML scraping
#   - feedparser           : RSS/Atom feeds
#   - playwright           : JavaScript-rendered pages

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"
DEFAULT_CONFIG = BASE_DIR / "config.yaml"

# Sites whose terms forbid scraping. We refuse these outright.
FORBIDDEN_HOSTS = ("linkedin.com", "indeed.com", "glassdoor.com")

MIN_INTERVAL_MINUTES = 15  # politeness floor; never poll a site more often

log = logging.getLogger("monitor")


# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #
def setup_logging(verbose: bool = True) -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log.setLevel(logging.DEBUG)
    log.handlers.clear()

    fmt = logging.Formatter("%(asctime)s %(levelname)-7s %(message)s",
                            datefmt="%Y-%m-%d %H:%M:%S")

    fh = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "monitor.log", maxBytes=1_000_000, backupCount=5,
        encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(fmt)
    log.addHandler(fh)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG if verbose else logging.INFO)
    ch.setFormatter(fmt)
    log.addHandler(ch)


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #
DEFAULTS = {
    "user_agent": "JobMonitor/1.0 (polite careers-page monitor)",
    "check_interval_minutes": 20,
    "request_timeout_seconds": 30,
    "respect_robots": True,
    "keywords": [],
    "match_in": "title_or_description",  # title_only | title_or_description | all
    "location_filter": "",
    "notify": {
        "channel": "ntfy",
        "ntfy": {"server": "https://ntfy.sh", "topic": "", "priority": "default"},
        "email": {
            "smtp_host": "", "smtp_port": 587, "use_tls": True,
            "username": "", "password": "", "from_addr": "", "to_addr": "",
        },
    },
    "targets": [],
}


def deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in (override or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def load_config(path: Path) -> dict:
    if not path.exists():
        sys.exit(f"Config file not found: {path}\n"
                 f"Copy config.example.yaml to config.yaml and edit it.")
    with open(path, "r", encoding="utf-8") as f:
        user_cfg = yaml.safe_load(f) or {}
    cfg = deep_merge(DEFAULTS, user_cfg)

    interval = int(cfg.get("check_interval_minutes") or 20)
    if interval < MIN_INTERVAL_MINUTES:
        log.warning("check_interval_minutes=%s is below the politeness floor; "
                    "raising to %s.", interval, MIN_INTERVAL_MINUTES)
        interval = MIN_INTERVAL_MINUTES
    cfg["check_interval_minutes"] = interval
    return cfg


# --------------------------------------------------------------------------- #
# State (per-target seen jobs + error flag)
# --------------------------------------------------------------------------- #
def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "target"


def state_path(target_name: str) -> Path:
    return DATA_DIR / f"seen_{slugify(target_name)}.json"


def load_state(target_name: str) -> dict:
    p = state_path(target_name)
    if p.exists():
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            data.setdefault("jobs", {})
            data.setdefault("baseline_done", bool(data["jobs"]))
            data.setdefault("error_active", False)
            return data
        except (json.JSONDecodeError, OSError) as e:
            log.warning("Could not read state %s (%s); starting fresh.", p, e)
    return {"jobs": {}, "baseline_done": False, "error_active": False,
            "last_success": None}


def save_state(target_name: str, state: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    p = state_path(target_name)
    tmp = p.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    tmp.replace(p)  # atomic on the same filesystem


# --------------------------------------------------------------------------- #
# HTTP helpers
# --------------------------------------------------------------------------- #
class Fetcher:
    def __init__(self, user_agent: str, timeout: int, respect_robots: bool):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent})
        self.timeout = timeout
        self.respect_robots = respect_robots
        self._robots_cache: dict[str, urllib.robotparser.RobotFileParser] = {}

    def allowed(self, url: str) -> bool:
        if not self.respect_robots:
            return True
        parts = urllib.parse.urlsplit(url)
        root = f"{parts.scheme}://{parts.netloc}"
        rp = self._robots_cache.get(root)
        if rp is None:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(root + "/robots.txt")
            try:
                rp.read()
            except Exception as e:  # robots unreachable -> default allow
                log.debug("robots.txt unreadable for %s (%s); allowing.", root, e)
                rp = None
            self._robots_cache[root] = rp
        if rp is None:
            return True
        ua = self.session.headers.get("User-Agent", "*")
        return rp.can_fetch(ua, url)

    def get(self, url: str, **kwargs) -> requests.Response:
        if not self.allowed(url):
            raise PermissionError(f"robots.txt disallows fetching {url}")
        r = self.session.get(url, timeout=self.timeout, **kwargs)
        r.raise_for_status()
        return r

    def post(self, url: str, **kwargs) -> requests.Response:
        if not self.allowed(url):
            raise PermissionError(f"robots.txt disallows fetching {url}")
        r = self.session.post(url, timeout=self.timeout, **kwargs)
        r.raise_for_status()
        return r


# --------------------------------------------------------------------------- #
# Job normalization
# --------------------------------------------------------------------------- #
def make_job(title, url, location="", posted_date="", job_id=None,
             description=""):
    title = (title or "").strip()
    url = (url or "").strip()
    location = (location or "").strip()
    if not job_id:
        basis = f"{title}|{url}".encode("utf-8")
        job_id = hashlib.sha256(basis).hexdigest()[:16]
    return {
        "job_id": str(job_id),
        "title": title,
        "location": location,
        "url": url,
        "posted_date": str(posted_date or ""),
        "description": (description or "").strip(),
    }


# --------------------------------------------------------------------------- #
# Source detectors -> each returns a list of normalized jobs
# --------------------------------------------------------------------------- #
def detect_type(url: str, explicit: str | None) -> str:
    if explicit and explicit != "auto":
        return explicit
    host = urllib.parse.urlsplit(url).netloc.lower()
    if "greenhouse.io" in host or "greenhouse.io" in url:
        return "greenhouse"
    if "lever.co" in host:
        return "lever"
    if "myworkdayjobs.com" in host:
        return "workday"
    if "governmentjobs.com" in host or "neogov" in host:
        return "governmentjobs"
    return "auto"  # resolved further down (rss -> html)


def fetch_greenhouse(fetcher: Fetcher, url: str, token: str | None) -> list[dict]:
    if not token:
        # token is the path segment after greenhouse.io/
        m = re.search(r"greenhouse\.io/(?:embed/job_board\?for=)?([A-Za-z0-9_-]+)", url)
        if not m:
            m = re.search(r"[?&]for=([A-Za-z0-9_-]+)", url)
        token = m.group(1) if m else None
    if not token:
        raise ValueError(f"Could not determine Greenhouse board token from {url}")
    api = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
    data = fetcher.get(api).json()
    jobs = []
    for j in data.get("jobs", []):
        loc = (j.get("location") or {}).get("name", "")
        jobs.append(make_job(
            title=j.get("title"),
            url=j.get("absolute_url"),
            location=loc,
            posted_date=j.get("updated_at") or j.get("first_published") or "",
            job_id=f"gh-{j.get('id')}",
            description=_strip_html(j.get("content", "")),
        ))
    return jobs


def fetch_lever(fetcher: Fetcher, url: str, company: str | None) -> list[dict]:
    if not company:
        m = re.search(r"lever\.co/([A-Za-z0-9_-]+)", url)
        company = m.group(1) if m else None
    if not company:
        raise ValueError(f"Could not determine Lever company from {url}")
    api = f"https://api.lever.co/v0/postings/{company}?mode=json"
    data = fetcher.get(api).json()
    jobs = []
    for j in data:
        cats = j.get("categories") or {}
        ts = j.get("createdAt")
        posted = ""
        if ts:
            try:
                posted = datetime.fromtimestamp(ts / 1000, timezone.utc).isoformat()
            except (TypeError, ValueError, OSError):
                posted = ""
        jobs.append(make_job(
            title=j.get("text"),
            url=j.get("hostedUrl") or j.get("applyUrl"),
            location=cats.get("location", ""),
            posted_date=posted,
            job_id=f"lever-{j.get('id')}",
            description=_strip_html(j.get("descriptionPlain") or j.get("description", "")),
        ))
    return jobs


def fetch_workday(fetcher: Fetcher, url: str) -> list[dict]:
    """Best-effort Workday cxs JSON endpoint.

    Workday careers URLs look like:
      https://<tenant>.<dc>.myworkdayjobs.com/<lang>/<site>
    The JSON endpoint is:
      https://<tenant>.<dc>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
    """
    parts = urllib.parse.urlsplit(url)
    host = parts.netloc
    tenant = host.split(".")[0]
    seg = [s for s in parts.path.split("/") if s]
    # last path segment is usually the site id; skip a leading language code
    site = seg[-1] if seg else ""
    if site and re.fullmatch(r"[a-z]{2}(-[A-Z]{2})?", site) and len(seg) >= 2:
        site = seg[-2]
    cxs = f"{parts.scheme}://{host}/wday/cxs/{tenant}/{site}/jobs"
    jobs: list[dict] = []
    offset = 0
    while True:
        body = {"appliedFacets": {}, "limit": 20, "offset": offset, "searchText": ""}
        resp = fetcher.post(cxs, json=body,
                            headers={"Accept": "application/json"})
        data = resp.json()
        postings = data.get("jobPostings", [])
        if not postings:
            break
        for p in postings:
            ext = p.get("externalPath", "")
            full = urllib.parse.urljoin(f"{parts.scheme}://{host}", ext) if ext else url
            jobs.append(make_job(
                title=p.get("title"),
                url=full,
                location=p.get("locationsText", ""),
                posted_date=p.get("postedOn", ""),
                job_id=f"wd-{ext or p.get('bulletFields', [''])[0]}",
            ))
        offset += 20
        total = data.get("total", 0)
        if offset >= total or offset > 2000:
            break
    return jobs


def fetch_governmentjobs(fetcher: Fetcher, url: str) -> list[dict]:
    """GovernmentJobs / NeoGov: try the RSS feed first, then HTML."""
    # Many agency pages support an RSS feed at .../rss or a 'rss' query.
    candidates = []
    if not url.rstrip("/").endswith("rss"):
        candidates.append(url.rstrip("/") + "/rss")
    candidates.append(url)
    for c in candidates:
        try:
            jobs = fetch_rss(fetcher, c)
            if jobs:
                return jobs
        except Exception as e:
            log.debug("governmentjobs RSS attempt failed for %s (%s)", c, e)
    return fetch_html(fetcher, url)


def fetch_rss(fetcher: Fetcher, url: str) -> list[dict]:
    try:
        import feedparser
    except ImportError:
        raise RuntimeError("feedparser not installed; cannot parse RSS/Atom. "
                           "pip install feedparser")
    raw = fetcher.get(url).content
    feed = feedparser.parse(raw)
    if feed.bozo and not feed.entries:
        raise ValueError(f"Not a valid feed: {url}")
    jobs = []
    for e in feed.entries:
        posted = ""
        if getattr(e, "published", None):
            posted = e.published
        elif getattr(e, "updated", None):
            posted = e.updated
        loc = ""
        # Some feeds expose location in a tag/category
        if getattr(e, "tags", None):
            loc = ", ".join(t.get("term", "") for t in e.tags if t.get("term"))
        jobs.append(make_job(
            title=getattr(e, "title", ""),
            url=getattr(e, "link", ""),
            location=loc,
            posted_date=posted,
            job_id=getattr(e, "id", None) or getattr(e, "guid", None),
            description=_strip_html(getattr(e, "summary", "")),
        ))
    return jobs


def discover_feed(fetcher: Fetcher, url: str, html: str) -> str | None:
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return None
    soup = BeautifulSoup(html, "html.parser")
    link = soup.find("link", attrs={"type": re.compile(r"application/(rss|atom)\+xml")})
    if link and link.get("href"):
        return urllib.parse.urljoin(url, link["href"])
    return None


JOB_LINK_HINT = re.compile(
    r"(job|career|position|posting|opening|requisition|vacanc|/jobs?/)", re.I)


def fetch_html(fetcher: Fetcher, url: str) -> list[dict]:
    """Generic HTML scrape. Heuristic; may need per-site tuning.

    Falls back to Playwright (headless Chromium) if the page looks
    JavaScript-rendered (little/no usable anchor content).
    """
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        raise RuntimeError("beautifulsoup4 not installed; cannot scrape HTML. "
                           "pip install beautifulsoup4")

    resp = fetcher.get(url)
    html = resp.text

    # Maybe there's a feed we should prefer.
    feed = discover_feed(fetcher, url, html)
    if feed:
        try:
            jobs = fetch_rss(fetcher, feed)
            if jobs:
                log.info("Discovered feed for %s -> %s", url, feed)
                return jobs
        except Exception as e:
            log.debug("Discovered feed %s failed (%s); scraping HTML.", feed, e)

    jobs = _scrape_anchors(BeautifulSoup(html, "html.parser"), url)
    if jobs:
        return jobs

    # Looks JS-rendered: try Playwright.
    log.info("No jobs found in static HTML for %s; trying Playwright.", url)
    rendered = _render_with_playwright(url, fetcher.session.headers.get("User-Agent"))
    if rendered:
        jobs = _scrape_anchors(BeautifulSoup(rendered, "html.parser"), url)
    return jobs


def _scrape_anchors(soup, base_url: str) -> list[dict]:
    seen = set()
    jobs = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        if not text or len(text) < 3:
            continue
        full = urllib.parse.urljoin(base_url, href)
        hint = JOB_LINK_HINT.search(href) or JOB_LINK_HINT.search(
            " ".join(a.get("class", [])) if a.get("class") else "")
        if not hint:
            continue
        if full in seen:
            continue
        seen.add(full)
        jobs.append(make_job(title=text, url=full))
    return jobs


def _render_with_playwright(url: str, user_agent: str | None) -> str | None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log.warning("Playwright not installed; cannot render JS page %s. "
                    "Install with: pip install playwright && playwright install chromium",
                    url)
        return None
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(user_agent=user_agent or "JobMonitor")
            page = ctx.new_page()
            page.goto(url, wait_until="networkidle", timeout=45000)
            content = page.content()
            browser.close()
            return content
    except Exception as e:
        log.warning("Playwright render failed for %s (%s).", url, e)
        return None


def _strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# --------------------------------------------------------------------------- #
# Fetch dispatcher
# --------------------------------------------------------------------------- #
def fetch_jobs(fetcher: Fetcher, target: dict) -> list[dict]:
    url = target["url"]
    ttype = detect_type(url, target.get("type"))
    log.info("Checking '%s' (%s) -> %s", target.get("name"), ttype, url)

    if ttype == "greenhouse":
        return fetch_greenhouse(fetcher, url, target.get("token"))
    if ttype == "lever":
        return fetch_lever(fetcher, url, target.get("company"))
    if ttype == "workday":
        return fetch_workday(fetcher, url)
    if ttype == "governmentjobs":
        return fetch_governmentjobs(fetcher, url)
    if ttype == "rss":
        return fetch_rss(fetcher, url)
    if ttype == "html":
        return fetch_html(fetcher, url)

    # auto: try RSS discovery via HTML path, else scrape.
    return fetch_html(fetcher, url)


# --------------------------------------------------------------------------- #
# Filtering
# --------------------------------------------------------------------------- #
def matches_filters(job: dict, keywords: list[str], match_in: str,
                    location_filter) -> bool:
    # location_filter may be a single string or a list of strings. A job
    # passes if its location contains ANY of the given terms (case-insensitive).
    locs = location_filter
    if isinstance(locs, str):
        locs = [locs] if locs.strip() else []
    locs = [l for l in (locs or []) if str(l).strip()]
    if locs:
        job_loc = (job.get("location", "")).lower()
        if not any(str(l).lower().strip() in job_loc for l in locs):
            return False
    if not keywords or match_in == "all":
        return True
    title = job.get("title", "").lower()
    desc = job.get("description", "").lower()
    for kw in keywords:
        kw = kw.lower().strip()
        if not kw:
            continue
        if match_in == "title_only":
            if kw in title:
                return True
        else:  # title_or_description
            if kw in title or kw in desc:
                return True
    return False


# --------------------------------------------------------------------------- #
# Notifications
# --------------------------------------------------------------------------- #
def notify(cfg: dict, title: str, message: str, url: str | None = None,
           priority: str | None = None, tags: str | None = None) -> bool:
    channel = cfg["notify"].get("channel", "ntfy")
    if channel == "ntfy":
        return _notify_ntfy(cfg, title, message, url, priority, tags)
    if channel == "email":
        return _notify_email(cfg, title, message, url)
    log.error("Unknown notify channel '%s'.", channel)
    return False


def _notify_ntfy(cfg, title, message, url, priority, tags) -> bool:
    nt = cfg["notify"]["ntfy"]
    topic = nt.get("topic", "").strip()
    server = nt.get("server", "https://ntfy.sh").rstrip("/")
    if not topic:
        log.error("ntfy topic is not configured; cannot send notification.")
        return False
    headers = {"Title": title.encode("utf-8")}
    headers["Priority"] = str(priority or nt.get("priority", "default"))
    if tags:
        headers["Tags"] = tags
    if url:
        headers["Click"] = url
        headers["Actions"] = f"view, Open job, {url}"
    try:
        r = requests.post(f"{server}/{topic}", data=message.encode("utf-8"),
                          headers=headers, timeout=20)
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        log.error("ntfy notification failed: %s", e)
        return False


def _notify_email(cfg, title, message, url) -> bool:
    em = cfg["notify"]["email"]
    required = ("smtp_host", "username", "password", "from_addr", "to_addr")
    if not all(em.get(k) for k in required):
        log.error("Email not fully configured (need %s).", ", ".join(required))
        return False
    body = message + (f"\n\n{url}" if url else "")
    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = title
    msg["From"] = em["from_addr"]
    msg["To"] = em["to_addr"]
    try:
        if em.get("use_tls", True):
            server = smtplib.SMTP(em["smtp_host"], int(em.get("smtp_port", 587)),
                                  timeout=30)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(em["smtp_host"], int(em.get("smtp_port", 465)),
                                      timeout=30)
        server.login(em["username"], em["password"])
        server.sendmail(em["from_addr"], [em["to_addr"]], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        log.error("Email notification failed: %s", e)
        return False


def notify_new_job(cfg: dict, target_name: str, job: dict) -> bool:
    title = f"New job: {job['title']}"
    lines = [job["title"]]
    if job.get("location"):
        lines.append(f"Location: {job['location']}")
    if job.get("posted_date"):
        lines.append(f"Posted: {job['posted_date']}")
    lines.append(f"Source: {target_name}")
    if job.get("url"):
        lines.append(job["url"])
    message = "\n".join(lines)
    ok = notify(cfg, title, message, url=job.get("url"),
                priority="high", tags="briefcase")
    log.info("Notified new job (%s): %s -> %s", "ok" if ok else "FAILED",
             job["title"], job.get("url"))
    return ok


# --------------------------------------------------------------------------- #
# Per-target processing
# --------------------------------------------------------------------------- #
def is_forbidden(url: str) -> bool:
    host = urllib.parse.urlsplit(url).netloc.lower()
    return any(bad in host for bad in FORBIDDEN_HOSTS)


def process_target(cfg: dict, fetcher: Fetcher, target: dict,
                   test_mode: bool = False) -> dict:
    """Returns a small summary dict for the run."""
    name = target.get("name") or slugify(target["url"])
    summary = {"name": name, "found": 0, "matched": 0, "new": 0, "error": None}

    if not target.get("enabled", True):
        log.info("Skipping disabled target '%s'.", name)
        return summary

    if is_forbidden(target["url"]):
        msg = (f"Refusing to scrape '{name}' ({target['url']}): this site's "
               f"terms forbid scraping. Use the employer's own careers page "
               f"or an official feed instead.")
        log.warning(msg)
        summary["error"] = "forbidden"
        return summary

    state = load_state(name)
    try:
        jobs = fetch_jobs(fetcher, target)
    except PermissionError as e:
        log.warning("robots.txt blocked '%s': %s", name, e)
        summary["error"] = "robots"
        _maybe_warn(cfg, state, name, str(e))
        save_state(name, state)
        return summary
    except Exception as e:
        log.error("Error checking '%s': %s", name, e, exc_info=False)
        summary["error"] = str(e)
        _maybe_warn(cfg, state, name,
                    f"'{name}' could not be checked: {e}")
        save_state(name, state)
        return summary

    # Recovered from a previous error?
    if state.get("error_active"):
        log.info("'%s' recovered after a previous error.", name)
        state["error_active"] = False

    summary["found"] = len(jobs)

    kw = cfg.get("keywords", [])
    match_in = cfg.get("match_in", "title_or_description")
    loc = cfg.get("location_filter", "")
    matched = [j for j in jobs if matches_filters(j, kw, match_in, loc)]
    summary["matched"] = len(matched)

    known = state["jobs"]
    new_jobs = [j for j in matched if j["job_id"] not in known]

    if not state.get("baseline_done"):
        # First run: record everything currently matching as baseline; do NOT notify.
        for j in matched:
            known[j["job_id"]] = _store_job(j)
        state["baseline_done"] = True
        state["last_success"] = _now()
        save_state(name, state)
        log.info("Baseline recorded for '%s': %d matching jobs (no notifications "
                 "on first run).", name, len(matched))
        summary["new"] = 0
        if test_mode:
            _print_jobs(name, matched, prefix="baseline")
        return summary

    # Subsequent run: notify on genuinely new matching jobs.
    for j in new_jobs:
        if not test_mode:
            notify_new_job(cfg, name, j)
        known[j["job_id"]] = _store_job(j)

    state["last_success"] = _now()
    save_state(name, state)
    summary["new"] = len(new_jobs)
    log.info("'%s': %d found, %d match filters, %d new.",
             name, len(jobs), len(matched), len(new_jobs))
    if test_mode:
        _print_jobs(name, matched, prefix="matched")
    return summary


def _store_job(j: dict) -> dict:
    return {
        "title": j["title"], "location": j["location"], "url": j["url"],
        "posted_date": j["posted_date"], "first_seen": _now(),
    }


def _maybe_warn(cfg: dict, state: dict, name: str, message: str) -> None:
    """Send exactly ONE warning per consecutive failure streak."""
    if state.get("error_active"):
        log.debug("Error for '%s' already notified; staying quiet.", name)
        return
    notify(cfg, f"Job monitor warning: {name}", message,
           priority="default", tags="warning")
    state["error_active"] = True


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _print_jobs(name: str, jobs: list[dict], prefix: str = "") -> None:
    print(f"\n=== {name} ({prefix}: {len(jobs)} jobs) ===")
    for j in jobs[:50]:
        loc = f" [{j['location']}]" if j.get("location") else ""
        print(f"  - {j['title']}{loc}\n    {j['url']}")
    if len(jobs) > 50:
        print(f"  ... and {len(jobs) - 50} more")


# --------------------------------------------------------------------------- #
# Run modes
# --------------------------------------------------------------------------- #
def run_once(cfg: dict, test_mode: bool = False) -> list[dict]:
    fetcher = Fetcher(cfg["user_agent"], cfg["request_timeout_seconds"],
                      cfg["respect_robots"])
    summaries = []
    targets = cfg.get("targets", [])
    if not targets:
        log.warning("No targets configured. Add some under 'targets' in config.yaml.")
    for i, target in enumerate(targets):
        if not target.get("url"):
            log.warning("Target #%d has no url; skipping.", i)
            continue
        summaries.append(process_target(cfg, fetcher, target, test_mode=test_mode))
        # polite gap between sites within a single cycle
        if i < len(targets) - 1:
            time.sleep(2)
    return summaries


def run_loop(cfg: dict) -> None:
    interval = cfg["check_interval_minutes"] * 60
    log.info("Starting loop: every %d minutes. Ctrl+C to stop.",
             cfg["check_interval_minutes"])
    while True:
        start = time.time()
        try:
            run_once(cfg, test_mode=False)
        except KeyboardInterrupt:
            log.info("Interrupted; exiting loop.")
            return
        except Exception as e:
            log.error("Unexpected error in cycle: %s", e, exc_info=True)
        elapsed = time.time() - start
        sleep_for = max(5, interval - elapsed)
        log.info("Cycle done in %.0fs; sleeping %.0f min.",
                 elapsed, sleep_for / 60)
        try:
            time.sleep(sleep_for)
        except KeyboardInterrupt:
            log.info("Interrupted; exiting loop.")
            return


def run_test(cfg: dict) -> None:
    print("Running in TEST mode: one pass, no 'new job' notifications, "
          "then a single test push.\n")
    summaries = run_once(cfg, test_mode=True)
    print("\n--- Summary ---")
    for s in summaries:
        if s["error"]:
            print(f"  {s['name']}: ERROR ({s['error']})")
        else:
            print(f"  {s['name']}: found={s['found']} matched={s['matched']} "
                  f"new={s['new']}")
    total_found = sum(s["found"] for s in summaries)
    total_match = sum(s["matched"] for s in summaries)
    ok = notify(
        cfg,
        "Job monitor test OK",
        f"Test notification. Checked {len(summaries)} target(s); "
        f"{total_found} jobs found, {total_match} match your filters. "
        f"If you see this, notifications work.",
        priority="default", tags="white_check_mark")
    print(f"\nTest notification sent: {'OK' if ok else 'FAILED (see log)'}")
    if not ok:
        print("Check your notify settings in config.yaml (ntfy topic or SMTP).")


def print_task_command(cfg: dict, config_path: Path) -> None:
    interval = cfg["check_interval_minutes"]
    py = sys.executable
    script = str(BASE_DIR / "monitor.py")
    # Prefer the venv pythonw.exe (no console window) if present on Windows.
    cmd = (
        f'schtasks /Create /TN "JobMonitor" /SC MINUTE /MO {interval} '
        f'/TR "\'{py}\' \'{script}\' --config \'{config_path}\'" /RL LIMITED /F'
    )
    print("\nWindows Task Scheduler — run every "
          f"{interval} minutes:\n")
    print(cmd)
    print("\nAlso run at startup (separate task):\n")
    print(f'schtasks /Create /TN "JobMonitorStartup" /SC ONSTART '
          f'/TR "\'{py}\' \'{script}\' --config \'{config_path}\'" /RL LIMITED /F')
    print("\nTo remove later:\n  schtasks /Delete /TN \"JobMonitor\" /F")
    print("  schtasks /Delete /TN \"JobMonitorStartup\" /F\n")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Polite job-posting monitor.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG),
                        help="Path to config.yaml")
    parser.add_argument("--loop", action="store_true",
                        help="Run forever, sleeping CHECK_INTERVAL between checks.")
    parser.add_argument("--test", action="store_true",
                        help="One pass, print findings, send a test notification.")
    parser.add_argument("--print-task", action="store_true",
                        help="Print the exact schtasks command for this machine.")
    parser.add_argument("-q", "--quiet", action="store_true",
                        help="Less console output.")
    args = parser.parse_args(argv)

    setup_logging(verbose=not args.quiet)
    config_path = Path(args.config).resolve()
    cfg = load_config(config_path)

    if args.print_task:
        print_task_command(cfg, config_path)
        return 0
    if args.test:
        run_test(cfg)
        return 0
    if args.loop:
        run_loop(cfg)
        return 0

    # Default: one-shot (for Task Scheduler)
    run_once(cfg, test_mode=False)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nInterrupted.")
        sys.exit(130)
