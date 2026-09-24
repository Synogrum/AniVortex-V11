#!/usr/bin/env python3
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
fail=[]
for name in ['09-carousel-live-action.html','10-carousel-movies-series.html','11-carousel-books.html']:
    text=(ROOT/'src/html/index'/name).read_text('utf-8')
    if re.search(r'class="[^"]*\bcard\b', text):
        fail.append(f'{name} still embeds full cards in initial HTML')

data=ROOT/'src/js/components/entertainment-data.js'
if not data.exists():
    fail.append('entertainment-data.js missing')
else:
    text=data.read_text('utf-8')
    if 'AniVortexEntertainmentData' not in text:
        fail.append('entertainment-data.js must expose AniVortexEntertainmentData')


footer=(ROOT/'src/html/index/13-footer-scripts-close.html').read_text('utf-8')
data_tag='assets/js/entertainment-data.js'
upc_tag='assets/js/UPC.js'
if data_tag not in footer:
    fail.append('entertainment-data.js script tag missing from footer partial')
elif upc_tag in footer and footer.index(data_tag) > footer.index(upc_tag):
    fail.append('entertainment-data.js script tag must appear before UPC.js')

manifest=json.loads((ROOT/'build-manifest.json').read_text('utf-8'))
files=manifest.get('js_files',[])
if 'entertainment-data.js' not in files:
    fail.append('entertainment-data.js missing from js_files manifest')
elif 'UPC.js' in files and files.index('entertainment-data.js') > files.index('UPC.js'):
    fail.append('entertainment-data.js must load before UPC.js')

if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - entertainment carousels are data-driven and lazy')
