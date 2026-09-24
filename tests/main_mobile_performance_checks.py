#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'src/css/components/hardening.css').read_text('utf-8')
fail=[]
for token in ['body .main-container .liquid-bg','body .main-container .smoke','body .main-container .inner-haze','filter: none']:
    if token not in css: fail.append(f'mobile Main performance rule missing {token}')
if fail:
    print('FAIL - mobile Main performance');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - mobile Main heavy ambient filters are disabled')
