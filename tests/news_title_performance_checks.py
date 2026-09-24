#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'src/js/main/02-core-widgets.js').read_text('utf-8')
css=(ROOT/'src/css/main/01-foundation.css').read_text('utf-8')
fail=[]
if 'function splitTitleCentered' in js or "querySelectorAll('.stire-title').forEach(splitTitleCentered)" in js:
    fail.append('news titles still use synchronous JS width measurement')
if 'text-wrap: balance' not in css and 'text-wrap: pretty' not in css:
    fail.append('news titles need CSS-native balanced wrapping')
if fail:
    print('FAIL')
    [print('-',x) for x in fail]
    raise SystemExit(1)
print('PASS - news title layout is CSS-native and non-blocking')
