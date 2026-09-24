#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
fail=[]
manager=root/'src/js/components/carousel-manager.js'
if not manager.exists():
    fail.append('carousel-manager.js is missing')
else:
    text=manager.read_text('utf-8',errors='replace')
    for token in ['AniVortexCarousel','createAutoplayController','bindInteractionPause']:
        if token not in text:
            fail.append(f'carousel manager missing {token}')
manifest=json.loads((root/'build-manifest.json').read_text('utf-8'))
if 'carousel-manager.js' not in manifest.get('js_files',[]):
    fail.append('carousel-manager.js missing from build manifest')
html=(root/'src/html/index/13-footer-scripts-close.html').read_text('utf-8',errors='replace')
if 'assets/js/carousel-manager.js' not in html:
    fail.append('carousel-manager.js missing from page scripts')
for rel in ['src/js/components/banner.js','src/js/components/trending.js','src/js/components/UPC.js','src/js/main/07-top-suggestions.js']:
    text=(root/rel).read_text('utf-8',errors='replace')
    if 'AniVortexCarousel' not in text:
        fail.append(f'{rel} is not using shared carousel manager')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - shared carousel manager checks passed')
