#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import re, sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'site'
failures=[]
soup=BeautifulSoup((root/'index.html').read_text('utf-8',errors='replace'),'html.parser')

for img in soup.find_all('img'):
    src=img.get('src','')
    if not src or src.startswith(('http://','https://','data:','blob:')):
        continue
    if src.startswith('/public/'):
        failures.append(f'Root-relative asset path (breaks subpath/local preview): {src}')
    rel=src.lstrip('/')
    if not (root/rel).exists():
        failures.append(f'Missing image: {src}')
    if not img.get('width') or not img.get('height'):
        failures.append(f'Image missing width/height: {src}')

# Quoted public asset references embedded in JS must resolve as well.
quoted = re.compile(r'''["'](public/[^"']+\.(?:png|jpe?g|webp|gif|svg))["']''', re.I)
for js in sorted((root/'assets/js').glob('*.js')):
    text=js.read_text('utf-8',errors='replace')
    for rel in quoted.findall(text):
        if not (root/rel).exists():
            failures.append(f'Missing JS asset in {js.name}: {rel}')

if failures:
    print('FAIL')
    for f in failures[:120]: print('-',f)
    if len(failures)>120: print(f'... {len(failures)-120} more')
    raise SystemExit(1)
print('PASS - asset checks passed')
