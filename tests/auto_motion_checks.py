#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
errors=[]
for p in (ROOT/'src/js').rglob('*.js'):
    text=p.read_text(encoding='utf-8')
    if 'setInterval' not in text:
        continue
    if p.name=='perf.js':
        continue
    if 'canRunAutoMotion' not in text:
        errors.append(f'{p.relative_to(ROOT)} uses setInterval without AniVortex auto-motion guard')
if errors:
    print('\n'.join('FAIL: '+e for e in errors))
    raise SystemExit(1)
print('PASS: recurring UI timers use the shared auto-motion guard')
