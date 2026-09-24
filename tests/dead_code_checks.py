#!/usr/bin/env python3
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
errors=[]
manifest=json.loads((ROOT/'build-manifest.json').read_text(encoding='utf-8'))
if 'card.js' in manifest.get('js_files',[]):
    errors.append('card.js is still included in the production JS manifest although its DOM targets do not exist')
footer=(ROOT/'src/html/index/13-footer-scripts-close.html').read_text(encoding='utf-8')
if 'card.js' in footer:
    errors.append('card.js is still loaded by index HTML')
text=(ROOT/'src/js/main/04-text-and-counters.js').read_text(encoding='utf-8')
if "getElementById('topList')" in text or 'getElementById("topList")' in text:
    errors.append('legacy #topList carousel code is still present although #topList does not exist')

if 'main/03-series-schedule.js' in manifest.get('js_bundles',{}).get('main.js',[]):
    errors.append('legacy stiri module main/03-series-schedule.js is still bundled although its DOM targets were removed')
series_path=ROOT/'src/js/main/03-series-schedule.js'
if series_path.exists():
    errors.append('legacy stiri module still exists in active src/js/main')

core=(ROOT/'src/js/main/02-core-widgets.js').read_text(encoding='utf-8')
if 'getElementById("continutZi")' in core or "getElementById('continutZi')" in core:
    errors.append('legacy #continutZi compatibility branch remains although the element does not exist')

hall=(ROOT/'src/js/main/08-hall-of-fame.js').read_text(encoding='utf-8')
if 'getElementById("statusDot")' in hall or "getElementById('statusDot')" in hall:
    errors.append('legacy #statusDot handler remains although status is delegated through hardening.js')

if errors:
    print('\n'.join('FAIL: '+e for e in errors))
    raise SystemExit(1)
print('PASS: known legacy JS with no DOM targets is excluded from production')
