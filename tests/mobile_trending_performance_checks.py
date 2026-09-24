#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
css = (root / 'src/css/components/hardening.css').read_text(encoding='utf-8')

required = [
    '@media (max-width: 768px)',
    '#trendingMaster',
    'backdrop-filter: none',
    '-webkit-backdrop-filter: none',
    'filter: none',
    'animation: none',
]
missing = [token for token in required if token not in css]
if missing:
    raise SystemExit('Missing mobile Trending performance hardening: ' + ', '.join(missing))
print('MOBILE TRENDING PERFORMANCE CHECKS PASS')
