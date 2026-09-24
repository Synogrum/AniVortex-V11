#!/usr/bin/env python3
"""QA against installed desktop browsers using Selenium.

This complements Playwright engine tests by launching the branded browsers
available on GitHub-hosted Windows/macOS runners. Chrome/Edge/Firefox run on
Windows; Safari runs through Apple's safaridriver on macOS when available.
"""
from __future__ import annotations

import argparse
import json
import math
import platform
import time
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import JavascriptException, WebDriverException
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

VIEWPORTS = ((360, 800), (390, 844), (430, 932), (1366, 768))
ZOOMS = (80, 100, 125, 150)


def launch(name: str):
    name = name.lower()
    if name == "chrome":
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
        return webdriver.Chrome(options=options)
    if name == "edge":
        options = webdriver.EdgeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
        return webdriver.Edge(options=options)
    if name == "firefox":
        options = webdriver.FirefoxOptions()
        options.add_argument("-headless")
        return webdriver.Firefox(options=options)
    if name == "safari":
        return webdriver.Safari()
    raise ValueError(f"unsupported browser: {name}")


def js(driver, source: str):
    return driver.execute_script(source)


def install_runtime_error_capture(driver):
    js(driver, r"""
      window.__avQaErrors = [];
      window.addEventListener('error', (event) => {
        window.__avQaErrors.push('error:' + (event.message || 'unknown'));
      });
      window.addEventListener('unhandledrejection', (event) => {
        let value = event.reason;
        try { value = value && (value.stack || value.message || String(value)); }
        catch (_) { value = 'unknown rejection'; }
        window.__avQaErrors.push('unhandledrejection:' + value);
      });
    """)


def browser_console_errors(driver, browser: str) -> list[str]:
    if browser not in {"chrome", "edge"}:
        return []
    try:
        items = driver.get_log("browser")
    except Exception:
        return []
    errors = []
    for item in items:
        level = str(item.get("level", "")).upper()
        if level in {"SEVERE", "ERROR"}:
            errors.append(f"{level}:{item.get('message', '')}")
    return errors


def visible(driver, selector: str):
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    for element in elements:
        try:
            if element.is_displayed():
                return element
        except Exception:
            pass
    return None


def safe_click(driver, selector: str) -> bool:
    element = visible(driver, selector)
    if not element:
        return False
    try:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        return True
    except Exception:
        try:
            driver.execute_script("arguments[0].click();", element)
            return True
        except Exception:
            return False


def exercise_once(driver, record: dict, errors: list[str]):
    if safe_click(driver, "#hamburger"):
        time.sleep(0.12)
        try:
            sidebar = driver.find_element(By.CSS_SELECTOR, "#sidebar")
            opened = sidebar.get_attribute("aria-hidden") == "false"
            record["sidebar_open"] = opened
            if not opened:
                errors.append("sidebar did not open")
        except Exception as exc:
            errors.append(f"sidebar check failed:{exc}")
        safe_click(driver, "#sidebarClose")

    cat = visible(driver, "#catBtn")
    if cat:
        try:
            cat.click()
            record["trending_category_clicked"] = True
            ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        except Exception as exc:
            errors.append(f"category interaction failed:{exc}")

    pair = visible(driver, ".trending-pair")
    if pair:
        try:
            ActionChains(driver).move_to_element(pair).perform()
            time.sleep(0.15)
            popup = visible(driver, "#hoverPopup")
            active = bool(popup and "active" in (popup.get_attribute("class") or ""))
            record["trending_popup_active"] = active
            if not active:
                errors.append("trending hover popup did not open")
        except Exception as exc:
            errors.append(f"trending popup interaction failed:{exc}")

    favorite = visible(driver, ".serii-favorite-refresh .fav-action")
    if favorite:
        try:
            favorite.send_keys(Keys.ENTER)
            time.sleep(0.1)
            popup = driver.find_elements(By.CSS_SELECTOR, "#favoriteStatusPopup")
            opened = bool(popup and popup[0].get_attribute("aria-hidden") == "false")
            record["favorite_menu_open"] = opened
            if not opened:
                errors.append("favorite keyboard menu did not open")
            ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        except Exception as exc:
            errors.append(f"favorite interaction failed:{exc}")

    card = visible(driver, ".carousel-collection .carousel-container .card")
    if card:
        try:
            card.send_keys(Keys.ENTER)
            time.sleep(0.1)
            if card.get_attribute("aria-expanded") != "true":
                errors.append("UPC popup did not set aria-expanded=true")
            ActionChains(driver).send_keys(Keys.ESCAPE).perform()
            if card.get_attribute("aria-expanded") != "false":
                errors.append("UPC popup did not reset aria-expanded=false")
        except Exception as exc:
            errors.append(f"UPC popup interaction failed:{exc}")

    try:
        driver.execute_script("""
          const nodes = [document.querySelector('#scrollArea'), ...document.querySelectorAll('.carousel-collection .carousel-container')].filter(Boolean);
          for (const el of nodes) { el.scrollLeft = el.scrollWidth; }
        """)
        time.sleep(0.08)
        driver.execute_script("""
          const nodes = [document.querySelector('#scrollArea'), ...document.querySelectorAll('.carousel-collection .carousel-container')].filter(Boolean);
          for (const el of nodes) { el.scrollLeft = 0; }
        """)
    except JavascriptException as exc:
        errors.append(f"carousel scroll failed:{exc.msg}")


def responsive_checks(driver, url: str, browser: str, screenshot_dir: Path | None) -> list[dict]:
    results = []
    for width, height in VIEWPORTS:
        errors: list[str] = []
        record = {"browser": browser, "viewport": [width, height]}
        try:
            driver.set_window_size(width, height)
            driver.get(url)
            time.sleep(1.0)
            install_runtime_error_capture(driver)
            inner = js(driver, "return [window.innerWidth, window.innerHeight, document.documentElement.scrollWidth];")
            record["inner_size"] = inner[:2]
            record["scroll_width"] = inner[2]
            if inner[2] > inner[0] + 2:
                errors.append(f"horizontal overflow:{inner[2]}>{inner[0]}")
            exercise_once(driver, record, errors)
            runtime = js(driver, "return window.__avQaErrors || [];")
            errors.extend(runtime)
            errors.extend(browser_console_errors(driver, browser))
            if screenshot_dir:
                screenshot_dir.mkdir(parents=True, exist_ok=True)
                driver.save_screenshot(str(screenshot_dir / f"{browser}-{width}x{height}.png"))
        except Exception as exc:
            errors.append(f"runtime:{type(exc).__name__}:{exc}")
        record["errors"] = errors
        results.append(record)
    return results


def _zoom_key(driver, direction: int):
    key = "+" if direction > 0 else "-"
    ActionChains(driver).key_down(Keys.CONTROL).send_keys(key).key_up(Keys.CONTROL).perform()
    time.sleep(0.25)


def zoom_checks(driver, url: str, browser: str) -> list[dict]:
    if browser not in {"chrome", "edge", "firefox"}:
        return []
    results = []
    driver.set_window_size(1366, 768)
    driver.get(url)
    time.sleep(0.8)
    ActionChains(driver).key_down(Keys.CONTROL).send_keys("0").key_up(Keys.CONTROL).perform()
    time.sleep(0.3)
    baseline = float(js(driver, "return window.innerWidth"))
    if baseline <= 0:
        return [{"browser": browser, "zoom_percent": None, "errors": ["could not measure baseline viewport"]}]

    current_est = 100.0
    for target in ZOOMS:
        errors: list[str] = []
        ActionChains(driver).key_down(Keys.CONTROL).send_keys("0").key_up(Keys.CONTROL).perform()
        time.sleep(0.25)
        best = (999.0, 100.0, baseline)
        direction = -1 if target < 100 else 1
        if target != 100:
            for _ in range(8):
                _zoom_key(driver, direction)
                inner = float(js(driver, "return window.innerWidth"))
                estimate = baseline / inner * 100.0 if inner else 0.0
                delta = abs(estimate - target)
                if delta < best[0]:
                    best = (delta, estimate, inner)
                if (direction < 0 and estimate <= target) or (direction > 0 and estimate >= target):
                    break
        else:
            inner = float(js(driver, "return window.innerWidth"))
            best = (abs(100 - target), 100.0, inner)

        _, current_est, inner = best
        scroll_width = float(js(driver, "return document.documentElement.scrollWidth"))
        # Firefox's native zoom ladder does not contain 125%; allow nearest browser level.
        tolerance = 4.0 if browser in {"chrome", "edge"} else 8.0
        if abs(current_est - target) > tolerance:
            errors.append(f"native zoom nearest level {current_est:.1f}% differs from requested {target}%")
        if scroll_width > inner + 2:
            errors.append(f"horizontal overflow at native zoom ~{current_est:.1f}%:{scroll_width}>{inner}")
        results.append({
            "browser": browser,
            "zoom_percent_requested": target,
            "zoom_percent_measured": round(current_est, 1),
            "inner_width": inner,
            "scroll_width": scroll_width,
            "errors": errors,
        })
    ActionChains(driver).key_down(Keys.CONTROL).send_keys("0").key_up(Keys.CONTROL).perform()
    return results


def soak(driver, url: str, browser: str, seconds: int) -> dict:
    errors: list[str] = []
    record = {"browser": browser, "soak_seconds": seconds, "cycles": 0}
    driver.set_window_size(1366, 768)
    driver.get(url)
    time.sleep(1.0)
    install_runtime_error_capture(driver)
    started = time.monotonic()
    while time.monotonic() - started < seconds:
        try:
            exercise_once(driver, record, errors)
            driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight * 0.5)")
            time.sleep(0.15)
            driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight)")
            time.sleep(0.15)
            driver.execute_script("window.scrollTo(0, 0)")
            time.sleep(0.15)
            record["cycles"] += 1
        except Exception as exc:
            errors.append(f"soak cycle:{type(exc).__name__}:{exc}")
            time.sleep(0.25)
        if len(errors) > 30:
            break
    try:
        errors.extend(js(driver, "return window.__avQaErrors || [];"))
    except Exception:
        pass
    errors.extend(browser_console_errors(driver, browser))
    try:
        inner = js(driver, "return [window.innerWidth, document.documentElement.scrollWidth];")
        if inner[1] > inner[0] + 2:
            errors.append(f"horizontal overflow after soak:{inner[1]}>{inner[0]}")
    except Exception:
        pass
    record["errors"] = list(dict.fromkeys(errors))
    return record


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--browser", choices=("chrome", "edge", "firefox", "safari"), required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--screenshots", type=Path)
    parser.add_argument("--soak-seconds", type=int, default=120)
    args = parser.parse_args()

    report = {
        "browser": args.browser,
        "platform": platform.platform(),
        "url": args.url,
        "responsive": [],
        "zoom": [],
        "soak": None,
    }
    failures: list[str] = []
    try:
        driver = launch(args.browser)
        driver.set_page_load_timeout(90)
        try:
            report["responsive"] = responsive_checks(driver, args.url, args.browser, args.screenshots)
            report["zoom"] = zoom_checks(driver, args.url, args.browser)
            report["soak"] = soak(driver, args.url, args.browser, args.soak_seconds)
        finally:
            driver.quit()
    except WebDriverException as exc:
        report["launch_error"] = str(exc)
        failures.append(f"launch:{exc}")
    except Exception as exc:
        report["launch_error"] = f"{type(exc).__name__}:{exc}"
        failures.append(report["launch_error"])

    for item in report["responsive"]:
        failures.extend(item.get("errors", []))
    for item in report["zoom"]:
        failures.extend(item.get("errors", []))
    if report["soak"]:
        failures.extend(report["soak"].get("errors", []))

    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")
    if failures:
        print("INSTALLED BROWSER QA FAILED")
        for failure in failures:
            print("-", failure)
        return 1
    print("INSTALLED BROWSER QA PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
