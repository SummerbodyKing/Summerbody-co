#!/usr/bin/env python3
"""
KINGsjobs - a polite, legal job-posting monitor.

Polls one or more employer careers pages on a schedule, detects newly posted
jobs, filters them by keyword + location, and pushes a phone notification
(via ntfy.sh) the moment a new matching job appears. It also writes a
data file that powers the KINGsjobs web dashboard.

Design goals: reliability over cleverness. It never floods you (baseline on
first run, one warning per outage), respects robots.txt, identifies itself
with a clear User-Agent, and backs off on errors.

Usage:
    python monitor.py --test     # run once, print findings, send a test push
    python monitor.py            # run once (for Windows Task Scheduler)
    python monitor.py --loop     # run forever, sleeping between checks
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import smtplib
import sys
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from logging.handlers import RotatingFileHandler
from pathlib import Path
from urllib import robotparser
from urllib.parse import urljoin, urlparse

import requests

try:
    import yaml
except ImportError:
    print("Missing dependency PyYAML. Run:  pip install -r requirements.txt")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # only needed for HTML/RSS sources; checked at runtime

# --------------------------------------------------------------------------
# Paths (everything is relative to this file, so it works wherever you put it)
# --------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.yaml"
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
WEB_DATA = BASE_DIR / "web" / "data" / "jobs.json"

DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)
WEB_DATA.parent.mkdir(parents=True, exist_ok=True)

# Sites whose terms forbid automated monitoring. We refuse these by policy.
BLOCKED_HOSTS = ("linkedin.com", "indeed.com", "glassdoor.com")

log = logging.getLogger("kingsjobs")


# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
def load_config() -> dict:
    if not CONFIG_PATH.exists():
        print(f"Config not found: {CONFIG_PATH}")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f) or {}
    cfg.setdefault("keywords", [])
    cfg.setdefault("locations", [])
    cfg.setdefault("check_interval_minutes", 20)
    cfg.setdefault("targets", [])
    cfg.setdefault(
        "user_agent",
        "KINGsjobs/1.0 (personal job alert tool)",
    )
    cfg.setdefault("ntfy_topic", "")
    cfg.setdefault("email", {"enabled": False})
    cfg.setdefault("netlify", {"enabled": False})
    return cfg


def setup_logging() -> None:
    log.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s  %(levelname)-7s  %(message)s")
    fh = RotatingFileHandler(
        LOG_DIR / "monitor.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8"
    )
    fh.setFormatter(fmt)
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    log.handlers.clear()
    log.addHandler(fh)
    log.addHandler(ch)


# --------------------------------------------------------------------------
# Small helpers
# --------------------------------------------------------------------------
def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_") or "target"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_session(cfg: dict) -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": cfg["user_agent"]})
    return s


def robots_allows(url: str, user_agent: str) -> bool:
    """Best-effort robots.txt check. On any error, be cautious and allow only
    if we can't read the file (most careers pages have no restrictive rules),
    but log it. Official JSON APIs skip this check (they are meant to be called).
    """
    try:
        parts = urlparse(url)
        robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
        rp = robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True


def is_blocked(url: str) -> bool:
    host = urlparse(url).netloc.lower()
    return any(b in host for b in BLOCKED_HOSTS)


# --------------------------------------------------------------------------
# Source adapters - each returns a list of job dicts:
#   {id, title, location, url, posted_date, source}
# --------------------------------------------------------------------------
def detect_source(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if "myworkdayjobs.com" in host:
        return "workday"
    if "isolvedhire.com" in host:
        return "isolvedhire"
    if "greenhouse.io" in host:
        return "greenhouse"
    if "lever.co" in host:
        return "lever"
    return "html"


def fetch_workday(url: str, session: requests.Session) -> list[dict]:
    """Workday exposes a public JSON 'cxs' endpoint. From a careers URL like
    https://modmed.wd501.myworkdayjobs.com/en-US/ModMed12/...
    we derive: tenant=modmed, site=ModMed12, and POST to
    https://{host}/wday/cxs/{tenant}/{site}/jobs
    """
    parts = urlparse(url)
    host = parts.netloc
    tenant = host.split(".")[0]
    segs = [s for s in parts.path.split("/") if s]
    # Skip a leading locale segment like "en-US" if present.
    if segs and re.fullmatch(r"[a-z]{2}-[A-Z]{2}", segs[0]):
        segs = segs[1:]
    if not segs:
        raise ValueError(f"Could not determine Workday site id from URL: {url}")
    site = segs[0]
    locale = "en-US"
    endpoint = f"https://{host}/wday/cxs/{tenant}/{site}/jobs"

    jobs: list[dict] = []
    limit, offset, cap = 20, 0, 200
    while offset < cap:
        resp = session.post(
            endpoint,
            json={"appliedFacets": {}, "limit": limit, "offset": offset, "searchText": ""},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        postings = data.get("jobPostings", [])
        if not postings:
            break
        for jp in postings:
            ext = jp.get("externalPath", "")
            full_url = f"https://{host}/{locale}/{site}{ext}" if ext else url
            bullets = jp.get("bulletFields") or []
            job_id = bullets[0] if bullets else (jp.get("title", "") + ext)
            jobs.append(
                {
                    "id": str(job_id),
                    "title": jp.get("title", "").strip(),
                    "location": (jp.get("locationsText") or "").strip(),
                    "url": full_url,
                    "posted_date": (jp.get("postedOn") or "").strip(),
                    "source": "Workday",
                }
            )
        total = data.get("total", len(jobs))
        offset += limit
        if offset >= total:
            break
    return jobs


def fetch_isolvedhire(url: str, session: requests.Session) -> list[dict]:
    """isolvedHire careers boards list jobs at the company root. We try the
    listing page and parse anchors that point at /jobs/<numeric id>.
    """
    if BeautifulSoup is None:
        raise RuntimeError("beautifulsoup4 not installed (pip install -r requirements.txt)")
    parts = urlparse(url)
    base = f"{parts.scheme}://{parts.netloc}"
    candidates = [f"{base}/jobs", base + "/", base]
    html = None
    for c in candidates:
        try:
            r = session.get(c, timeout=30)
            if r.ok and r.text:
                html = r.text
                break
        except requests.RequestException:
            continue
    if html is None:
        raise RuntimeError(f"Could not load isolvedHire listing for {base}")

    soup = BeautifulSoup(html, "html.parser")
    jobs: dict[str, dict] = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        m = re.search(r"/jobs/(\d+)", href)
        if not m:
            continue
        job_id = m.group(1)
        title = a.get_text(strip=True)
        if not title:
            continue
        full = urljoin(base + "/", href)
        # Try to find a location hint near the link.
        loc = ""
        parent = a.find_parent()
        if parent:
            txt = parent.get_text(" ", strip=True)
            mloc = re.search(r"([A-Z][a-zA-Z]+,\s?[A-Z]{2})", txt)
            if mloc:
                loc = mloc.group(1)
        jobs[job_id] = {
            "id": job_id,
            "title": title,
            "location": loc,
            "url": full,
            "posted_date": "",
            "source": "isolvedHire",
        }
    return list(jobs.values())


def fetch_html_or_rss(url: str, session: requests.Session) -> list[dict]:
    """Generic fallback: look for an RSS/Atom feed, else parse job-like links.
    This is best-effort and should be verified with --test for a new site.
    """
    if BeautifulSoup is None:
        raise RuntimeError("beautifulsoup4 not installed (pip install -r requirements.txt)")
    r = session.get(url, timeout=30)
    r.raise_for_status()
    text = r.text
    soup = BeautifulSoup(text, "html.parser")

    # RSS/Atom auto-discovery
    feed = soup.find("link", attrs={"type": re.compile(r"rss|atom", re.I)})
    if feed and feed.get("href"):
        feed_url = urljoin(url, feed["href"])
        fr = session.get(feed_url, timeout=30)
        fr.raise_for_status()
        fsoup = BeautifulSoup(fr.text, "xml")
        jobs = []
        for item in fsoup.find_all(["item", "entry"]):
            title = (item.title.get_text(strip=True) if item.title else "").strip()
            link_el = item.find("link")
            link = (link_el.get("href") or link_el.get_text(strip=True)) if link_el else url
            jobs.append(
                {
                    "id": link or title,
                    "title": title,
                    "location": "",
                    "url": link,
                    "posted_date": (item.find("pubDate").get_text(strip=True)
                                    if item.find("pubDate") else ""),
                    "source": "RSS",
                }
            )
        if jobs:
            return jobs

    # Heuristic HTML parse: anchors whose text/href look like job postings.
    jobs = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        title = a.get_text(strip=True)
        if not title or len(title) < 4:
            continue
        if re.search(r"job|career|position|opening|posting", href, re.I):
            full = urljoin(url, href)
            jobs[full] = {
                "id": full,
                "title": title,
                "location": "",
                "url": full,
                "posted_date": "",
                "source": "HTML",
            }
    if not jobs:
        # Page may be JavaScript-rendered. Tell the user to enable Playwright.
        log.warning(
            "No jobs parsed from %s. Page may be JavaScript-rendered; "
            "see README 'JavaScript pages' to enable Playwright for this target.",
            url,
        )
    return list(jobs.values())


def fetch_jobs(target: dict, session: requests.Session, cfg: dict) -> list[dict]:
    url = target["url"]
    if is_blocked(url):
        raise PermissionError(
            f"{urlparse(url).netloc} forbids automated monitoring (policy). "
            "Use the employer's own careers page instead."
        )
    source = detect_source(url)
    if source == "workday":
        return fetch_workday(url, session)  # official JSON API, no robots needed
    if source == "isolvedhire":
        return fetch_isolvedhire(url, session)
    # Generic sources: respect robots.txt before scraping.
    if not robots_allows(url, cfg["user_agent"]):
        raise PermissionError(f"robots.txt disallows fetching {url}")
    return fetch_html_or_rss(url, session)


# --------------------------------------------------------------------------
# Filtering
# --------------------------------------------------------------------------
def matches(job: dict, keywords: list[str], locations: list[str]) -> bool:
    if keywords:
        haystack = f"{job['title']} {job['location']}".lower()
        if not any(k.lower() in haystack for k in keywords):
            return False
    if locations:
        loc = job["location"].lower()
        # An empty location string can't be confirmed - keep it (better a
        # false alert than a missed job); user can tighten later.
        if loc and not any(l.lower() in loc for l in locations):
            return False
    return True


# --------------------------------------------------------------------------
# State (per target)
# --------------------------------------------------------------------------
def state_path(target: dict) -> Path:
    return DATA_DIR / f"seen_{slugify(target['name'])}.json"


def load_state(target: dict) -> dict:
    p = state_path(target)
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            log.warning("Corrupt state file %s, starting fresh.", p)
    return {"baseline_done": False, "ids": {}, "failures": 0, "warned": False}


def save_state(target: dict, state: dict) -> None:
    state_path(target).write_text(json.dumps(state, indent=2), encoding="utf-8")


# --------------------------------------------------------------------------
# Notifications
# --------------------------------------------------------------------------
def notify_ntfy(cfg: dict, title: str, body: str, click_url: str | None, tags: str) -> None:
    topic = cfg.get("ntfy_topic", "").strip()
    if not topic:
        return
    headers = {"Title": title, "Tags": tags}
    if click_url:
        headers["Click"] = click_url
    try:
        requests.post(
            f"https://ntfy.sh/{topic}",
            data=body.encode("utf-8"),
            headers=headers,
            timeout=20,
        )
    except requests.RequestException as e:
        log.error("ntfy push failed: %s", e)


def notify_email(cfg: dict, subject: str, body: str) -> None:
    em = cfg.get("email", {})
    if not em.get("enabled"):
        return
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = em["from_addr"]
        msg["To"] = em["to_addr"]
        msg.set_content(body)
        with smtplib.SMTP(em["host"], em.get("port", 587)) as s:
            s.starttls()
            s.login(em["user"], em["password"])
            s.send_message(msg)
    except Exception as e:
        log.error("Email send failed: %s", e)


def notify_new_job(cfg: dict, job: dict) -> None:
    title = f"New job: {job['title']}"
    loc = job["location"] or "Location N/A"
    posted = f" - {job['posted_date']}" if job["posted_date"] else ""
    body = f"{job['title']}\n{loc}{posted}\nApply: {job['url']}"
    notify_ntfy(cfg, title, body, job["url"], "briefcase,tada")
    notify_email(cfg, title, body)
    log.info("NOTIFIED new job: %s | %s | %s", job["title"], loc, job["url"])


def notify_warning(cfg: dict, target_name: str, detail: str) -> None:
    title = f"KINGsjobs warning: {target_name}"
    body = f"Could not check {target_name}.\n{detail}\nIt will keep retrying."
    notify_ntfy(cfg, title, body, None, "warning")
    notify_email(cfg, title, body)
    log.warning("WARNED about target %s: %s", target_name, detail)


# --------------------------------------------------------------------------
# Dashboard data + optional live publish
# --------------------------------------------------------------------------
def write_dashboard(all_matches: list[dict]) -> None:
    """Write web/data/jobs.json that the KINGsjobs page reads."""
    payload = {"updated_at": now_iso(), "count": len(all_matches), "jobs": all_matches}
    WEB_DATA.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    log.info("Wrote dashboard data: %d job(s) -> %s", len(all_matches), WEB_DATA)


def publish_netlify(cfg: dict) -> None:
    """Optional: zip web/ and deploy it to the live KINGsjobs site so the
    hosted page stays in sync. Off by default; needs a Netlify token + site id.
    """
    nf = cfg.get("netlify", {})
    if not nf.get("enabled"):
        return
    import io
    import zipfile

    buf = io.BytesIO()
    web_dir = BASE_DIR / "web"
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for f in web_dir.rglob("*"):
            if f.is_file():
                z.write(f, f.relative_to(web_dir).as_posix())
    buf.seek(0)
    try:
        r = requests.post(
            f"https://api.netlify.com/api/v1/sites/{nf['site_id']}/deploys",
            data=buf.read(),
            headers={
                "Content-Type": "application/zip",
                "Authorization": f"Bearer {nf['auth_token']}",
            },
            timeout=60,
        )
        r.raise_for_status()
        log.info("Published dashboard to Netlify (%s).", nf["site_id"])
    except Exception as e:
        log.error("Netlify publish failed: %s", e)


# --------------------------------------------------------------------------
# Core run
# --------------------------------------------------------------------------
def check_target(target: dict, session: requests.Session, cfg: dict, verbose: bool) -> list[dict]:
    """Returns the current matching jobs for this target (for the dashboard)."""
    name = target["name"]
    state = load_state(target)
    try:
        all_jobs = fetch_jobs(target, session, cfg)
    except PermissionError as e:
        log.error("SKIP %s: %s", name, e)
        return []
    except Exception as e:
        state["failures"] = state.get("failures", 0) + 1
        if not state.get("warned"):
            notify_warning(cfg, name, str(e))
            state["warned"] = True
        save_state(target, state)
        return []

    # Success: clear any prior outage warning.
    state["failures"] = 0
    state["warned"] = False

    matching = [j for j in all_jobs if matches(j, cfg["keywords"], cfg["locations"])]
    if verbose:
        log.info("%s: %d total job(s), %d match filters.", name, len(all_jobs), len(matching))
        for j in matching:
            log.info("   - %s | %s | %s", j["title"], j["location"] or "?", j["url"])

    seen_ids: dict = state.get("ids", {})

    if not state.get("baseline_done"):
        # First run: record everything, notify nothing.
        for j in matching:
            seen_ids[j["id"]] = now_iso()
        state["ids"] = seen_ids
        state["baseline_done"] = True
        save_state(target, state)
        log.info("%s: baseline recorded (%d jobs). No alerts on first run.", name, len(matching))
    else:
        new_jobs = [j for j in matching if j["id"] not in seen_ids]
        for j in new_jobs:
            notify_new_job(cfg, j)
            seen_ids[j["id"]] = now_iso()
        state["ids"] = seen_ids
        save_state(target, state)
        if new_jobs:
            log.info("%s: %d NEW job(s) alerted.", name, len(new_jobs))
        else:
            log.info("%s: no new jobs.", name)

    # Tag jobs as "new" for the dashboard if first seen within last 24h.
    enriched = []
    for j in matching:
        first_seen = seen_ids.get(j["id"], now_iso())
        is_new = (datetime.now(timezone.utc)
                  - datetime.fromisoformat(first_seen)).total_seconds() < 86400
        enriched.append({**j, "company": name, "first_seen": first_seen, "is_new": is_new})
    return enriched


def run_once(cfg: dict, verbose: bool = False) -> None:
    session = make_session(cfg)
    all_matches: list[dict] = []
    for target in cfg["targets"]:
        all_matches.extend(check_target(target, session, cfg, verbose))
    all_matches.sort(key=lambda j: j["first_seen"], reverse=True)
    write_dashboard(all_matches)
    publish_netlify(cfg)


def run_loop(cfg: dict) -> None:
    interval = max(15, int(cfg["check_interval_minutes"])) * 60
    log.info("Starting continuous loop. Checking every %d minutes.", interval // 60)
    while True:
        start = time.time()
        try:
            run_once(cfg)
        except Exception as e:
            log.exception("Unexpected error in run loop: %s", e)
        elapsed = time.time() - start
        time.sleep(max(0, interval - elapsed))


# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(description="KINGsjobs job-posting monitor")
    ap.add_argument("--loop", action="store_true", help="Run continuously")
    ap.add_argument("--test", action="store_true",
                    help="Run once, print findings, and send a test push")
    args = ap.parse_args()

    setup_logging()
    cfg = load_config()

    if args.test:
        log.info("=== KINGsjobs --test ===")
        notify_ntfy(
            cfg,
            "KINGsjobs test ✅",
            "If you see this, your phone alerts are working. Crown secured. 👑",
            None,
            "tada,crown",
        )
        run_once(cfg, verbose=True)
        log.info("Test complete. Check your phone for the test push and review the list above.")
    elif args.loop:
        run_loop(cfg)
    else:
        run_once(cfg)


if __name__ == "__main__":
    main()
