#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'site'
soup=BeautifulSoup((root/'index.html').read_text('utf-8',errors='replace'),'html.parser')
fail=[]
hero=soup.select_one('.banner.active .hero-image')
if not hero:
    fail.append('active hero image not found')
else:
    if hero.get('fetchpriority')!='high': fail.append('active hero lacks fetchpriority=high')
    if hero.get('loading') not in (None,'eager'): fail.append('active hero must not be lazy')
    src=hero.get('src')
    preload=soup.find('link',attrs={'rel':lambda v:v and 'preload' in v,'as':'image','href':src})
    if not preload: fail.append(f'active hero not preloaded: {src}')
if not soup.find('link',attrs={'rel':lambda v:v and 'icon' in v}):
    fail.append('favicon link missing')
if fail:
    print('FAIL')
    for f in fail: print('-',f)
    raise SystemExit(1)
print('PASS - performance metadata checks passed')
