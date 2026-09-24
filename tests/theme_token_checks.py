#!/usr/bin/env python3
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
tokens=root/'src/css/components/tokens.css'
fail=[]
if not tokens.exists(): fail.append('Missing tokens.css')
for css in sorted((root/'src/css').rglob('*.css')):
    if css==tokens: continue
    text=css.read_text('utf-8',errors='replace')
    for literal in ('#d4b77a','#b8925e','#052a2e'):
        if re.search(re.escape(literal),text,re.I):
            fail.append(f'Raw theme color {literal} left in {css.relative_to(root)}')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - core theme colors use shared tokens')
