#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'src/html/index/04-main-left.html').read_text('utf-8')
css='\n'.join(p.read_text('utf-8',errors='ignore') for p in (ROOT/'src/css').rglob('*.css'))
fail=[]
if 'stiri-anime-legacy' in html: fail.append('hidden legacy news markup still exists')
if '.stiri-anime-legacy' in css: fail.append('legacy news hide rule still exists')
if fail:
    print('FAIL - legacy news cleanup');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - hidden legacy news markup is removed')
