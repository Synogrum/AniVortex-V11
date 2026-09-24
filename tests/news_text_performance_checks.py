#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
active='\n'.join(p.read_text('utf-8',errors='ignore') for p in (ROOT/'src').rglob('*') if p.is_file() and p.suffix in {'.html','.js','.css'})
fail=[]
for token in ['.stire-text.text-mic','.stire-text.text-mediu','.stire-text.text-mare','stiri-anime-legacy']:
    if token in active:
        fail.append(f'legacy news text implementation remains active: {token}')
if fail:
    print('FAIL');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - legacy news text implementation is removed from active production source')
