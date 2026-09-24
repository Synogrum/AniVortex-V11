#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'src/js/components/hot-news-new.js').read_text('utf-8')
fail=[]
for token in ['function hydrateHotNews','IntersectionObserver','rootMargin','aria-busy']:
    if token not in js: fail.append(f'hot news lazy hydration missing {token}')
# Initial execution must not render the full grid unconditionally.
if '\n  renderPage(1);\n' in js:
    fail.append('Hot News still renders all 45 cards unconditionally at startup')
if fail:
    print('FAIL - hot news lazy hydration');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - Hot News defers heavy card hydration until near viewport')
