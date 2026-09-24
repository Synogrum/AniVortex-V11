#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
fail=[]
body=(root/'src/css/components/body.css').read_text('utf-8',errors='replace')
upc=(root/'src/css/components/UPC.css').read_text('utf-8',errors='replace')
core=(root/'src/js/main/02-core-widgets.js').read_text('utf-8',errors='replace')

if 'min-height: 100dvh' not in body:
    fail.append('Body should include a dynamic viewport-height fallback for mobile browsers')
if 'touch-action: pan-y' not in upc:
    fail.append('UPC carousel should allow native vertical touch scrolling while handling horizontal drag')
if 'max-height: calc(100dvh - 16px)' not in upc:
    fail.append('UPC popup should use dynamic viewport height on mobile')
if '<img src="${serie.imagine}" alt="Poster ${serie.nume}" loading="lazy" decoding="async">' not in core:
    fail.append('JS-generated recent-post images should be lazy-decoded')

if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - responsive/performance refinements passed')
