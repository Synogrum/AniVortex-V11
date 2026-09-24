#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css='\n'.join(p.read_text('utf-8',errors='ignore') for p in (ROOT/'src/css').rglob('*.css'))
fail=[]
for token in ['.av10-card:not(:hover):not(:focus-within) .av10-glow','.av10-card:not(:hover):not(:focus-within) .av10-ring','animation-play-state: paused']:
    if token not in css: fail.append(f'comments idle-motion guard missing {token}')
if '@media (max-width: 768px)' not in css or '.av10-message' not in css:
    fail.append('mobile comments optimization block missing')
if fail:
    print('FAIL - comments motion budget');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - comment decorations idle cheaply and animate on interaction')
