#!/usr/bin/env python3
import importlib.util
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
script = root / 'scripts/migrate_important.py'
spec = importlib.util.spec_from_file_location('migrate_important', script)
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
spec.loader.exec_module(mod)
G = mod.GUARD
cases = {
    '.x': f'.x{G}',
    '.x::before': f'.x{G}::before',
    '.x:hover::after': f'.x:hover{G}::after',
    '.x:before': f'.x{G}:before',
    'body .x::first-letter': f'body .x{G}::first-letter',
}
failed = []
for original, expected in cases.items():
    actual = mod.add_guard(original)
    if actual != expected:
        failed.append(f'{original} -> {actual!r}; expected {expected!r}')

# The specificity guard is intentionally minimal: two impossible IDs are enough
# because production selectors are kept below two real IDs. This avoids the old
# eight-ID selector noise while preserving priority semantics.
if mod.GUARD.count("#__av_prio_") != 2:
    failed.append(f"Unexpected priority guard size: {mod.GUARD}")

import tinycss2
import cssselect2
for css in sorted((root / "src/css").rglob("*.css")):
    rules = tinycss2.parse_stylesheet(css.read_text("utf-8", errors="replace"), skip_whitespace=True, skip_comments=True)
    stack = list(rules)
    while stack:
        rule = stack.pop()
        if rule.type == "qualified-rule":
            selector = tinycss2.serialize(rule.prelude).strip()
            if "#__av_prio_" in selector:
                continue
            try:
                compiled = cssselect2.compile_selector_list(selector)
            except Exception:
                continue
            if any(item.specificity[0] >= 2 for item in compiled):
                failed.append(f"Selector with >=2 IDs would outrank guard assumptions in {css.relative_to(root)}: {selector}")
                break
        elif rule.type == "at-rule" and rule.content is not None:
            try:
                stack.extend(tinycss2.parse_rule_list(rule.content, skip_whitespace=True, skip_comments=True))
            except Exception:
                pass

if failed:
    print('FAIL')
    for item in failed: print('-', item)
    raise SystemExit(1)
print('PASS - migration selector checks passed')
