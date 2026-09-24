#!/usr/bin/env python3
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
text=(ROOT/'src/js/components/header.js').read_text('utf-8')
fail=[]
# The state updater may be used by the scroll handler, but must not be called eagerly
# during DOMContentLoaded because reading scrollY forces a full layout on startup.
body=text.split('const scheduleHeaderState',1)[1] if 'const scheduleHeaderState' in text else text
if re.search(r'addEventListener\("scroll"[^\n]*\n\s*updateHeaderState\(\)', body):
    fail.append('header performs an eager updateHeaderState() after binding scroll')
# More direct guard for the exact legacy pattern.
if 'window.addEventListener("scroll", scheduleHeaderState, { passive: true });\n  updateHeaderState();' in text:
    fail.append('header startup still forces a synchronous layout read')
if fail:
    print('FAIL')
    [print('-',x) for x in fail]
    raise SystemExit(1)
print('PASS - header startup avoids synchronous full-page layout')
