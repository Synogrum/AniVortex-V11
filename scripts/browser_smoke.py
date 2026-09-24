#!/usr/bin/env python3
"""Chromium smoke test without localhost/file navigation.

The execution environment can block local navigation, so the deploy HTML is loaded
with local CSS/JS inlined. Local images are replaced with a transparent pixel while
keeping their declared dimensions/classes; this preserves layout geometry without
network access.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_VIEWPORTS = [(360, 800), (390, 844), (430, 932), (768, 1024), (1366, 768), (1920, 1080), (2560, 1440)]
BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="


def inline_document(site: Path) -> str:
    html = (site / "index.html").read_text("utf-8")
    html = re.sub(r'<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>', '', html, flags=re.I)

    css_parts: list[str] = []
    for href in re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', html, flags=re.I):
        if href.startswith("assets/"):
            css_parts.append((site / href.split("?", 1)[0]).read_text("utf-8"))
    html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', '', html, flags=re.I)
    html = re.sub(r'<link[^>]+(?:preconnect|preload)[^>]*>', '', html, flags=re.I)

    js_parts: list[str] = []
    for src in re.findall(r'<script[^>]+src="([^"]+)"[^>]*></script>', html, flags=re.I):
        if src.startswith("assets/"):
            js_parts.append((site / src.split("?", 1)[0]).read_text("utf-8"))
    html = re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>', '', html, flags=re.I)

    # Avoid network/file requests but keep layout dimensions and CSS classes intact.
    html = re.sub(r'\s+srcset="[^"]*"', '', html, flags=re.I)
    html = re.sub(r'\s+sizes="[^"]*"', '', html, flags=re.I)
    html = re.sub(
        r'(<img\b[^>]*?\bsrc=")[^"]+("[^>]*>)',
        lambda match: match.group(1) + BLANK_IMAGE + match.group(2),
        html,
        flags=re.I,
    )

    css = "\n".join(css_parts).replace("</style>", "")
    js = "\n".join(js_parts).replace("</script>", "<\\/script>")
    html = html.replace("</head>", f"<style>{css}</style></head>")
    html = html.replace("</body>", f"<script>{js}</script></body>")
    return html


def chromium_executable() -> str | None:
    for candidate in (shutil.which("chromium"), shutil.which("chromium-browser"), shutil.which("google-chrome")):
        if candidate:
            return candidate
    return None


def run(site: Path, screenshot_dir: Path | None = None) -> list[dict]:
    document = inline_document(site)
    results: list[dict] = []
    executable = chromium_executable()

    if screenshot_dir:
        screenshot_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        launch_kwargs = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        if executable:
            launch_kwargs["executable_path"] = executable
        browser = playwright.chromium.launch(**launch_kwargs)

        for width, height in DEFAULT_VIEWPORTS:
            page = browser.new_page(viewport={"width": width, "height": height})
            errors: list[str] = []
            page.on("console", lambda msg, errors=errors: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
            page.on("pageerror", lambda exc, errors=errors: errors.append(f"pageerror:{exc}"))
            page.set_content(document, wait_until="load", timeout=60_000)
            page.wait_for_timeout(700)

            initial_scroll_y = page.evaluate("window.scrollY")
            scroll_width = page.evaluate("document.documentElement.scrollWidth")
            record = {
                "viewport": [width, height],
                "initial_scroll_y": initial_scroll_y,
                "scroll_width": scroll_width,
                "console_errors": errors.copy(),
            }

            if initial_scroll_y > 2:
                errors.append(f"page moved on load: scrollY={initial_scroll_y}")
            if scroll_width > width + 2:
                errors.append(f"horizontal document overflow: scrollWidth={scroll_width}, viewport={width}")

            # Keyboard menu behavior (one representative viewport is enough).
            if width == 1366:
                favorite = page.locator(".serii-favorite-refresh .fav-action").first
                if favorite.count():
                    favorite.focus()
                    favorite.evaluate("el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))")
                    popup = page.locator("#favoriteStatusPopup")
                    page.wait_for_timeout(1000)
                    record["favorite_menu_open"] = popup.get_attribute("aria-hidden") == "false"
                    active_role = page.evaluate("document.activeElement?.getAttribute('role')")
                    record["favorite_menu_focus_role"] = active_role
                    page.keyboard.press("ArrowDown")
                    page.keyboard.press("Escape")
                    record["favorite_focus_restored"] = page.evaluate(
                        "document.activeElement?.classList.contains('fav-action') === true"
                    )
                    if not record["favorite_menu_open"]:
                        errors.append("favorite keyboard menu did not open")
                    if active_role != "menuitem":
                        errors.append("favorite keyboard menu did not focus a menuitem")
                    if not record["favorite_focus_restored"]:
                        errors.append("favorite menu did not restore focus on Escape")

            # UPC keyboard dialog state/focus and viewport placement.
            if width in (390, 1366):
                card = page.locator(".carousel-collection .carousel-container .card").first
                if card.count():
                    card.focus()
                    card.press("Enter")
                    page.wait_for_timeout(80)
                    expanded = card.get_attribute("aria-expanded")
                    panel = page.locator(".av-card-popover-wrap:not([hidden]) .av-popup-panel").first
                    record["upc_expanded"] = expanded
                    if expanded != "true" or not panel.count():
                        errors.append("UPC keyboard popup did not expose expanded dialog state")
                    elif width == 390:
                        rect = panel.bounding_box()
                        record["upc_popup_rect"] = rect
                        if rect and (rect["x"] < -2 or rect["x"] + rect["width"] > width + 2):
                            errors.append(f"UPC popup leaves mobile viewport horizontally: {rect}")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(20)
                    if card.get_attribute("aria-expanded") != "false":
                        errors.append("UPC popup did not reset aria-expanded on Escape")
                    focused_card = page.evaluate("document.activeElement?.classList.contains('card') === true")
                    record["upc_focus_restored"] = focused_card
                    if not focused_card:
                        errors.append("UPC popup did not restore focus on Escape")

            if screenshot_dir:
                page.evaluate("window.scrollTo(0, 0)")
                page.screenshot(path=str(screenshot_dir / f"{width}x{height}.png"), full_page=False)

            record["errors"] = errors
            results.append(record)
            page.close()

        browser.close()
    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", type=Path, default=ROOT / "site")
    parser.add_argument("--screenshots", type=Path)
    parser.add_argument("--report", type=Path, default=ROOT / "audit" / "browser-smoke.json")
    args = parser.parse_args()

    results = run(args.site, args.screenshots)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(results, ensure_ascii=False, indent=2), "utf-8")

    errors = [f"{item['viewport']}: {error}" for item in results for error in item["errors"]]
    if errors:
        print("BROWSER SMOKE FAILED")
        for error in errors:
            print("-", error)
        return 1

    print(f"BROWSER SMOKE PASS - {len(results)} viewports, report={args.report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
