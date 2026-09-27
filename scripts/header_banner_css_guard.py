from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "site" / "assets" / "css"

# Header/Banner visual ownership:
# - header.css owns Header visuals
# - banner.css owns Banner visuals
# - tokens.css owns shared HB variables
# hardening.css may only contain performance/motion rules for these components.
FORBIDDEN_VISUAL_PROPS = re.compile(
    r"\b(?:background(?:-color|-image)?|color|font(?:-family|-size|-weight)?|"
    r"border(?:-color)?|box-shadow|text-shadow)\s*:",
    re.I,
)

HB_SELECTOR = re.compile(
    r"(?:\.header\b|\.nav-item\b|\.action-btn\b|\.search-box\b|"
    r"\.banner\b|\.title-text\b|\.genre-row\b|\.tag-sub\b|\.tag-dub\b|"
    r"\.meta-big\b|\.meta-item\b|\.description\b|\.btn-view\b|\.btn-details\b|"
    r"\.image-card\b|\.info-button\b|\.info-tooltip\b)"
)

def blocks(text: str):
    i = 0
    while i < len(text):
        brace = text.find("{", i)
        if brace < 0:
            break
        selector = text[i:brace].strip()
        depth = 1
        j = brace + 1
        while j < len(text) and depth:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
            j += 1
        if depth == 0:
            yield selector, text[brace + 1:j - 1]
        i = j

errors = []

hardening = (CSS / "hardening.css").read_text(encoding="utf-8")
for selector, body in blocks(hardening):
    if HB_SELECTOR.search(selector) and FORBIDDEN_VISUAL_PROPS.search(body):
        errors.append(f"hardening.css visual HB rule: {selector[:140]}")

# No later-loaded component stylesheet may own Header/Banner visual selectors.
for name in ["body.css", "trending.css", "chrono.css", "footer.css", "hot-news-new.css", "com.css", "main.css", "UPC.css"]:
    text = (CSS / name).read_text(encoding="utf-8")
    for selector, body in blocks(text):
        if HB_SELECTOR.search(selector) and FORBIDDEN_VISUAL_PROPS.search(body):
            errors.append(f"{name} visual HB rule: {selector[:140]}")

banner = (CSS / "banner.css").read_text(encoding="utf-8")
required = {
    ".title-text:not(#__av_prio_a#__av_prio_b)": "--hb-banner-title-size",
    ".genre-row:not(#__av_prio_a#__av_prio_b)": "--hb-banner-genre-size",
    ".description:not(#__av_prio_a#__av_prio_b)": "--hb-banner-body-size",
    ".btn:not(#__av_prio_a#__av_prio_b)": "--hb-banner-button-size",
}
for selector, token in required.items():
    idx = banner.find(selector)
    if idx < 0:
        errors.append(f"missing canonical specificity bridge: {selector}")
        continue
    brace = banner.find("{", idx)
    end = banner.find("}", brace)
    body = banner[brace:end]
    if token not in body:
        errors.append(f"{selector} does not use {token}")

header = (CSS / "header.css").read_text(encoding="utf-8")
if "V12.16 — HEADER HB-01" in header:
    errors.append("header.css still contains obsolete appended V12.16 theme layer")
if "V12.16 — BANNER HB-01" in banner:
    errors.append("banner.css still contains obsolete appended V12.16 theme layer")

if errors:
    print("HEADER/BANNER CSS OWNERSHIP FAIL")
    for error in errors:
        print("-", error)
    sys.exit(1)

print("HEADER/BANNER CSS OWNERSHIP PASS")
