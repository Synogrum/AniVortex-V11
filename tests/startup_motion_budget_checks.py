#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
perf=(ROOT/'src/js/components/perf.js').read_text('utf-8')
css=(ROOT/'src/css/components/hardening.css').read_text('utf-8')
fail=[]
for token in ['av-motion-active','intersectionRatio','threshold']:
    if token not in perf: fail.append(f'motion gate missing {token}')
if '.trending-master-container:not(.av-motion-active)' not in css:
    fail.append('regions are not paused by default before first intersection')
for sel in ['.nebula','.header-fx .smoke','.header-fx .orb','.banner .bubble','.banner .scan-light']:
    if sel not in css: fail.append(f'mobile startup motion budget missing {sel}')
if fail:
    print('FAIL - startup motion budget');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - startup motion is gated before expensive effects run')
