#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'src/css/components/hardening.css').read_text('utf-8')
fail=[]
for token in [
    'body .nebula:not(#__av_prio_a#__av_prio_b)',
    'body .header-fx .smoke:not(#__av_prio_a#__av_prio_b)',
    'body .banner .bubble:not(#__av_prio_a#__av_prio_b)',
    'display: none;',
    'body .header:not(#__av_prio_a#__av_prio_b)',
    'body .banner .image-card:not(#__av_prio_a#__av_prio_b)',
    'body .sidebar-overlay:not(#__av_prio_a#__av_prio_b)',
    'backdrop-filter: none;'
]:
    if token not in css: fail.append(f'mobile compositing budget missing {token}')
if fail:
    print('FAIL - mobile compositing budget');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - mobile top-of-page compositing is bounded')
