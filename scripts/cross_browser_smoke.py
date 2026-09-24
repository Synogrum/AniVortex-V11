#!/usr/bin/env python3
"""Cross-browser smoke test for AniVortex.

Uses the same navigation-free document inlining as browser_smoke.py so the test is
stable in restricted environments. In CI Playwright installs Chromium, Firefox,
and WebKit; locally a subset can be requested with --engines.
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError, sync_playwright

from browser_smoke import DEFAULT_VIEWPORTS, inline_document

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENGINES = ("chromium", "firefox", "webkit")


def _launch(playwright, engine: str):
    browser_type = getattr(playwright, engine)
    kwargs = {"headless": True}
    if engine == "chromium":
        system_chromium = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
        if system_chromium:
            kwargs.update({
                "executable_path": system_chromium,
                "args": ["--no-sandbox", "--disable-dev-shm-usage"],
            })
    return browser_type.launch(**kwargs)


def run(site: Path, engines: tuple[str, ...], viewports=DEFAULT_VIEWPORTS) -> list[dict]:
    document = inline_document(site)
    results: list[dict] = []

    with sync_playwright() as playwright:
        for engine in engines:
            try:
                browser = _launch(playwright, engine)
            except PlaywrightError as exc:
                results.append({
                    "engine": engine,
                    "viewport": None,
                    "errors": [f"browser unavailable: {exc}"],
                })
                continue

            for width, height in viewports:
                page = browser.new_page(viewport={"width": width, "height": height})
                errors: list[str] = []
                page.on("console", lambda msg, errors=errors: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
                page.on("pageerror", lambda exc, errors=errors: errors.append(f"pageerror:{exc}"))

                try:
                    page.set_content(document, wait_until="load", timeout=60_000)
                    page.wait_for_timeout(700)
                    scroll_y = page.evaluate("window.scrollY")
                    scroll_width = page.evaluate("document.documentElement.scrollWidth")
                    viewport_width = page.evaluate("window.innerWidth")

                    if scroll_y > 2:
                        errors.append(f"page moved on load: scrollY={scroll_y}")
                    if scroll_width > viewport_width + 2:
                        errors.append(f"horizontal document overflow: scrollWidth={scroll_width}, viewport={viewport_width}")

                    # Representative keyboard interaction on desktop.
                    if width == 1366:
                        favorite = page.locator(".serii-favorite-refresh .fav-action").first
                        if favorite.count():
                            favorite.focus()
                            favorite.press("Enter")
                            page.wait_for_timeout(80)
                            popup = page.locator("#favoriteStatusPopup")
                            if popup.count() and popup.get_attribute("aria-hidden") != "false":
                                errors.append("favorite keyboard menu did not open")
                            page.keyboard.press("Escape")

                        card = page.locator(".carousel-collection .carousel-container .card").first
                        if card.count():
                            card.focus()
                            card.press("Enter")
                            page.wait_for_timeout(80)
                            if card.get_attribute("aria-expanded") != "true":
                                errors.append("UPC keyboard popup did not set aria-expanded=true")
                            page.keyboard.press("Escape")
                            if card.get_attribute("aria-expanded") != "false":
                                errors.append("UPC keyboard popup did not reset aria-expanded=false")
                except Exception as exc:  # browser-engine-specific runtime failure
                    errors.append(f"runtime:{type(exc).__name__}:{exc}")

                results.append({
                    "engine": engine,
                    "viewport": [width, height],
                    "errors": errors,
                })
                page.close()

            browser.close()

    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", type=Path, default=ROOT / "site")
    parser.add_argument("--engines", nargs="+", choices=DEFAULT_ENGINES, default=list(DEFAULT_ENGINES))
    parser.add_argument("--report", type=Path, default=ROOT / "audit" / "cross-browser-smoke.json")
    args = parser.parse_args()

    results = run(args.site, tuple(args.engines))
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(results, ensure_ascii=False, indent=2), "utf-8")

    errors = [f"{item['engine']} {item['viewport']}: {error}" for item in results for error in item["errors"]]
    if errors:
        print("CROSS BROWSER SMOKE FAILED")
        for error in errors:
            print("-", error)
        return 1

    print(f"CROSS BROWSER SMOKE PASS - {len(args.engines)} engines x {len(DEFAULT_VIEWPORTS)} viewports")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
