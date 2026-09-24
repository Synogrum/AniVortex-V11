#!/usr/bin/env python3
"""Live AniVortex smoke/interaction/performance QA against an HTTP(S) URL."""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import Error as PlaywrightError, sync_playwright

DEFAULT_VIEWPORTS = [(360, 800), (390, 844), (430, 932), (1366, 768), (1920, 1080)]
DEFAULT_ENGINES = ("chromium", "firefox", "webkit")
ZOOM_LAYOUTS = ((80, 1708, 960), (100, 1366, 768), (125, 1093, 614), (150, 911, 512))

PERF_INIT = r"""
(() => {
  window.__avPerf = { lcp: 0, cls: 0, inp: 0, supported: {} };
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) window.__avPerf.lcp = last.startTime || last.renderTime || last.loadTime || 0;
    }).observe({type: 'largest-contentful-paint', buffered: true});
    window.__avPerf.supported.lcp = true;
  } catch (_) { window.__avPerf.supported.lcp = false; }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__avPerf.cls += e.value || 0;
    }).observe({type: 'layout-shift', buffered: true});
    window.__avPerf.supported.cls = true;
  } catch (_) { window.__avPerf.supported.cls = false; }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__avPerf.inp = Math.max(window.__avPerf.inp, e.duration || 0);
    }).observe({type: 'event', buffered: true, durationThreshold: 16});
    window.__avPerf.supported.inp = true;
  } catch (_) { window.__avPerf.supported.inp = false; }
})();
"""


def _launch(playwright, engine: str):
    browser_type = getattr(playwright, engine)
    kwargs = {"headless": True}
    if engine == "chromium":
        system = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
        if system:
            kwargs.update({"executable_path": system, "args": ["--no-sandbox", "--disable-dev-shm-usage"]})
    return browser_type.launch(**kwargs)


def _safe_click(page, selector: str):
    locator = page.locator(selector).first
    if locator.count() and locator.is_visible():
        locator.click(timeout=3000, force=True)
        return True
    return False


def _exercise(page, width: int, errors: list[str], record: dict):
    # Main menu open/close.
    if _safe_click(page, "#hamburger"):
        page.wait_for_timeout(100)
        sidebar = page.locator("#sidebar")
        record["sidebar_open"] = sidebar.get_attribute("aria-hidden") == "false" if sidebar.count() else False
        if not record["sidebar_open"]:
            errors.append("sidebar did not open")
        page.keyboard.press("Escape")
        page.wait_for_timeout(160)
        if sidebar.count() and sidebar.get_attribute("aria-hidden") == "false":
            errors.append("sidebar did not close with Escape")

    # Trending category control/menu.
    if _safe_click(page, "#catBtn"):
        page.wait_for_timeout(80)
        record["trending_category_clicked"] = True
        page.keyboard.press("Escape")

    # Trending is intentionally hover-only; do not require hover popups on touch/mobile widths.
    pair = page.locator(".trending-pair").first
    if pair.count() and pair.is_visible():
        if width >= 768:
            pair.dispatch_event("mouseenter")
            page.wait_for_timeout(150)
            popup = page.locator("#hoverPopup")
            active = popup.count() and "active" in (popup.get_attribute("class") or "")
            record["trending_popup_active"] = bool(active)
            if not active:
                errors.append("trending hover popup did not open")
            else:
                rect = popup.bounding_box()
                record["trending_popup_rect"] = rect
                if rect and (rect["x"] < -3 or rect["x"] + rect["width"] > width + 3):
                    errors.append(f"trending popup leaves viewport horizontally: {rect}")
            pair.dispatch_event("mouseleave")
            page.wait_for_timeout(80)
        else:
            record["trending_popup_check"] = "skipped-hover-only-on-touch-width"

    # Favorite keyboard menu.
    favorite = page.locator(".serii-favorite-refresh .fav-action").first
    if favorite.count() and favorite.is_visible():
        favorite.focus()
        favorite.press("Enter")
        page.wait_for_timeout(80)
        fav_popup = page.locator("#favoriteStatusPopup")
        is_open = fav_popup.count() and fav_popup.get_attribute("aria-hidden") == "false"
        record["favorite_menu_open"] = bool(is_open)
        if not is_open:
            errors.append("favorite keyboard menu did not open")
        page.keyboard.press("Escape")

    # UPC: use touch/tap semantics on mobile widths and keyboard activation on desktop.
    card = page.locator(".carousel-collection .carousel-container .card").first
    if card.count() and card.is_visible():
        opened = False
        for _ in range(3):
            card = page.locator(".carousel-collection .carousel-container .card").first
            if width < 768:
                card.evaluate("el => el.click()")
            else:
                card.focus()
                card.evaluate("""
                    el => el.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'Enter', code: 'Enter', bubbles: true, cancelable: true
                    }))
                """)
            page.wait_for_timeout(100)
            popup_open = page.locator(".av-card-popover-wrap.is-open").count() > 0
            expanded = page.locator('.carousel-collection .card[aria-expanded="true"]').count() > 0
            if popup_open and expanded:
                opened = True
                break
            if width >= 768:
                fresh = page.locator(".carousel-collection .carousel-container .card").first
                fresh.evaluate("""
                    el => el.dispatchEvent(new PointerEvent('pointerover', {
                        bubbles: true, pointerType: 'mouse'
                    }))
                """)
                page.wait_for_timeout(100)
                popup_open = page.locator(".av-card-popover-wrap.is-open").count() > 0
                expanded = page.locator('.carousel-collection .card[aria-expanded="true"]').count() > 0
                if popup_open and expanded:
                    opened = True
                    break
        record["upc_popup_open"] = bool(opened)
        if not opened:
            errors.append("UPC popup did not open from touch/keyboard/hover activation")
        else:
            page.keyboard.press("Escape")
            page.wait_for_timeout(100)
            if page.locator(".av-card-popover-wrap.is-open").count() > 0:
                errors.append("UPC popup did not close with Escape")

    # Exercise horizontal extremes in Trending and each entertainment carousel.
    horizontal = page.locator("#scrollArea")
    if horizontal.count():
        max_scroll = horizontal.evaluate("el => Math.max(0, el.scrollWidth - el.clientWidth)")
        record["trending_max_scroll"] = max_scroll
        horizontal.evaluate("el => { el.scrollLeft = el.scrollWidth; }")
        page.wait_for_timeout(60)
        horizontal.evaluate("el => { el.scrollLeft = 0; }")

    carousel_count = page.locator(".carousel-collection .carousel-container").count()
    record["carousel_count"] = carousel_count
    for idx in range(carousel_count):
        car = page.locator(".carousel-collection .carousel-container").nth(idx)
        car.evaluate("el => { el.scrollLeft = el.scrollWidth; }")
        page.wait_for_timeout(40)
        car.evaluate("el => { el.scrollLeft = 0; }")



def _overflow_elements(page, viewport_width: int) -> list[dict]:
    return page.evaluate(
        """(viewportWidth) => Array.from(document.querySelectorAll('body *'))
          .map((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id || '',
              cls: typeof el.className === 'string' ? el.className.trim().replace(/\\s+/g, '.') : '',
              left: Math.round(r.left * 10) / 10,
              right: Math.round(r.right * 10) / 10,
              width: Math.round(r.width * 10) / 10,
              cssWidth: cs.width,
              minWidth: cs.minWidth,
              maxWidth: cs.maxWidth,
              position: cs.position,
              overflowX: cs.overflowX
            };
          })
          .filter((x) => x.width > 0 && (x.right > viewportWidth + 2 || x.left < -2))
          .sort((a,b) => Math.max(b.right-viewportWidth, -b.left) - Math.max(a.right-viewportWidth, -a.left))
          .slice(0, 12)""",
        viewport_width,
    )

def run(url: str, engines: tuple[str, ...], screenshot_dir: Path | None = None) -> list[dict]:
    results: list[dict] = []
    if screenshot_dir:
        screenshot_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        for engine in engines:
            try:
                browser = _launch(playwright, engine)
            except PlaywrightError as exc:
                results.append({"engine": engine, "viewport": None, "errors": [f"browser unavailable: {exc}"]})
                continue

            for width, height in DEFAULT_VIEWPORTS:
                page = browser.new_page(viewport={"width": width, "height": height}, has_touch=(width < 768))
                page.add_init_script(PERF_INIT)
                errors: list[str] = []
                failed_requests: list[str] = []
                page.on("console", lambda msg, errors=errors: errors.append(
                    f"console:{msg.type}:{msg.text} @ {msg.location.get('url','')}:{msg.location.get('lineNumber','')}"
                ) if msg.type == "error" else None)
                page.on("pageerror", lambda exc, errors=errors: errors.append(f"pageerror:{exc}"))
                page.on("requestfailed", lambda req, failed_requests=failed_requests: failed_requests.append(f"{req.method} {req.url}: {req.failure}"))
                record = {"engine": engine, "viewport": [width, height], "url": url}
                try:
                    response = page.goto(url, wait_until="networkidle", timeout=90_000)
                    record["status"] = response.status if response else None
                    if response and response.status >= 400:
                        errors.append(f"HTTP status {response.status}")
                    page.wait_for_timeout(900)
                    scroll_width = page.evaluate("document.documentElement.scrollWidth")
                    record["scroll_width"] = scroll_width
                    if scroll_width > width + 2:
                        offenders = _overflow_elements(page, width)
                        record["overflow_elements"] = offenders
                        errors.append(f"horizontal document overflow: scrollWidth={scroll_width}, viewport={width}, offenders={offenders[:6]}")
                    _exercise(page, width, errors, record)
                    # Let carousels/timers run for a little while, then scroll through the page.
                    page.wait_for_timeout(1200)
                    page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight * 0.5)")
                    page.wait_for_timeout(250)
                    page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
                    page.wait_for_timeout(250)
                    page.evaluate("window.scrollTo(0, 0)")
                    page.wait_for_timeout(100)
                    record["perf"] = page.evaluate("window.__avPerf || null")
                    if screenshot_dir:
                        page.screenshot(path=str(screenshot_dir / f"{engine}-{width}x{height}.png"), full_page=False)
                except Exception as exc:
                    errors.append(f"runtime:{type(exc).__name__}:{exc}")
                record["failed_requests"] = failed_requests
                if failed_requests:
                    errors.extend(f"requestfailed:{item}" for item in failed_requests[:10])
                record["errors"] = errors
                results.append(record)
                page.close()

            # Desktop browser-zoom layout stress. Browser zoom changes CSS viewport size roughly as physical_px/zoom.
            for zoom, width, height in ZOOM_LAYOUTS:
                page = browser.new_page(viewport={"width": width, "height": height})
                errors: list[str] = []
                try:
                    response = page.goto(url, wait_until="networkidle", timeout=90_000)
                    if response and response.status >= 400:
                        errors.append(f"HTTP status {response.status}")
                    page.wait_for_timeout(500)
                    scroll_width = page.evaluate("document.documentElement.scrollWidth")
                    if scroll_width > width + 2:
                        offenders = _overflow_elements(page, width)
                        errors.append(f"horizontal overflow at zoom-equivalent {zoom}%: {scroll_width}>{width}, offenders={offenders[:6]}")
                except Exception as exc:
                    errors.append(f"runtime:{type(exc).__name__}:{exc}")
                results.append({
                    "engine": engine,
                    "zoom_equivalent_percent": zoom,
                    "viewport": [width, height],
                    "errors": errors,
                })
                page.close()
            browser.close()
    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--engines", nargs="+", choices=DEFAULT_ENGINES, default=list(DEFAULT_ENGINES))
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--screenshots", type=Path)
    args = parser.parse_args()

    parsed = urlparse(args.url)
    if parsed.scheme not in {"http", "https"}:
        raise SystemExit("--url must use http or https")

    results = run(args.url, tuple(args.engines), args.screenshots)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(results, ensure_ascii=False, indent=2), "utf-8")
    failures = [f"{r.get('engine')} {r.get('viewport')}: {e}" for r in results for e in r.get("errors", [])]
    if failures:
        print("LIVE SITE QA FAILED")
        for item in failures:
            print("-", item)
        return 1
    print(f"LIVE SITE QA PASS - {len(results)} checks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
