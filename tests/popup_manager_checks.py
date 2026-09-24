#!/usr/bin/env python3
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
fail=[]
manager = root/'src/js/components/popup-manager.js'
if not manager.exists():
    fail.append('popup-manager.js is missing')
else:
    text=manager.read_text('utf-8',errors='replace')
    for token in ['AniVortexPopup','placeAdjacent','createPositionScheduler','bindViewportTracking']:
        if token not in text:
            fail.append(f'popup manager missing {token}')
manifest=json.loads((root/'build-manifest.json').read_text('utf-8'))
if 'popup-manager.js' not in manifest.get('js_files',[]):
    fail.append('popup-manager.js missing from build manifest')
html=(root/'src/html/index/13-footer-scripts-close.html').read_text('utf-8',errors='replace')
if 'assets/js/popup-manager.js' not in html:
    fail.append('popup-manager.js missing from page scripts')
for rel in ['src/js/components/trending.js','src/js/components/UPC.js','src/js/main/01-favorites.js','src/js/main/05-episode-popup.js']:
    text=(root/rel).read_text('utf-8',errors='replace')
    if 'AniVortexPopup' not in text:
        fail.append(f'{rel} is not using shared popup manager')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - shared popup manager checks passed')
