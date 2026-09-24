#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
perf=(ROOT/'src/js/components/perf.js').read_text('utf-8')
css=(ROOT/'src/css/components/hardening.css').read_text('utf-8')
fail=[]
for token in ['av-top-motion-active','manageTopMotion','body.classList.toggle']:
    if token not in perf: fail.append(f'top-motion lifecycle missing {token}')
for token in ['body:not(.av-top-motion-active) .nebula','body:not(.av-top-motion-active) .header-fx .smoke','body:not(.av-top-motion-active) .header-fx .orb']:
    if token not in css: fail.append(f'top ambient pause missing {token}')
if fail:
    print('FAIL - top motion lifecycle');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - top ambient motion pauses away from the hero')
