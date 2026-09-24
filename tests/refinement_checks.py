#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
fail = []

# 1) :not() must be a pseudo-class, never a pseudo-element (::not is invalid CSS).
for css in sorted((root / 'src/css').rglob('*.css')):
    text = css.read_text('utf-8', errors='replace')
    if '::not(' in text:
        fail.append(f'Invalid ::not() selector in {css.relative_to(root)}')
    if 'data:image/' in text and 'base64,' in text:
        fail.append(f'Embedded base64 image left in CSS: {css.relative_to(root)}')

# 2) Comment symbol declarations must resolve to real optimized files.
com_js = root / 'src/js/components/com.js'
text = com_js.read_text('utf-8', errors='replace')
for symbol in re.findall(r"\bsymbol:\s*['\"]([^'\"]+)['\"]", text):
    asset = root / 'site/public/imgs/simboluri' / symbol
    if not asset.exists():
        fail.append(f'Missing comment symbol asset: {symbol}')

# 3) Do not couple layout rules to an image file extension/path.
for css in sorted((root / 'src/css/com').glob('*.css')):
    text = css.read_text('utf-8', errors='replace')
    if re.search(r':has\([^)]*\.av10-symbol-img\[src\$=', text):
        fail.append(f'Brittle symbol src selector in {css.relative_to(root)}')

if fail:
    print('FAIL')
    for item in fail:
        print('-', item)
    raise SystemExit(1)

print('PASS - refinement checks passed')
