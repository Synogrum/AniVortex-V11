#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
fail = []
for html in sorted((root / 'src/html').rglob('*.html')):
    text = html.read_text('utf-8', errors='replace')
    for match in re.finditer(r'\sstyle\s*=\s*["\']', text, re.I):
        line = text.count('\n', 0, match.start()) + 1
        fail.append(f'Inline style attribute in {html.relative_to(root)}:{line}')

if fail:
    print('FAIL')
    for item in fail[:80]: print('-', item)
    raise SystemExit(1)
print('PASS - source HTML has no inline style attributes')
