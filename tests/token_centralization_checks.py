#!/usr/bin/env python3
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
tokens=ROOT/'src/css/components/tokens.css'
errors=[]
for p in (ROOT/'src/css').rglob('*.css'):
    if p==tokens:
        continue
    if re.search(r'(?m)^\s*:root\s*\{', p.read_text(encoding='utf-8')):
        errors.append(f'{p.relative_to(ROOT)} defines :root variables outside tokens.css')
if errors:
    print('\n'.join('FAIL: '+e for e in errors))
    raise SystemExit(1)
print('PASS: global :root design variables are centralized in tokens.css')
