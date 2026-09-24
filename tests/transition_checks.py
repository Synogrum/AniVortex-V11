#!/usr/bin/env python3
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
errors=[]
pat=re.compile(r'\btransition(?:-property)?\s*:\s*all(?:\s|;)', re.I)
for p in (ROOT/'src/css').rglob('*.css'):
    text=p.read_text(encoding='utf-8')
    for m in pat.finditer(text):
        line=text.count('\n',0,m.start())+1
        errors.append(f'{p.relative_to(ROOT)}:{line}: avoid transition: all')
if errors:
    print('\n'.join('FAIL: '+x for x in errors))
    raise SystemExit(1)
print('PASS: CSS transitions target explicit properties')
