#!/usr/bin/env python3
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'build-manifest.json').read_text('utf-8'))
version=manifest.get('asset_version')
fail=[]
if not version:
    fail.append('build-manifest.json has no asset_version')
html=(root/'site/index.html').read_text('utf-8',errors='replace')
if '{{ASSET_VERSION}}' in html:
    fail.append('Unresolved ASSET_VERSION placeholder in site/index.html')
refs=re.findall(r'(?:href|src)="(assets/(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=([^"]+))?"',html)
for asset,ref_version in refs:
    if ref_version != version:
        fail.append(f'{asset} has cache version {ref_version!r}, expected {version!r}')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print(f'PASS - local asset cache version is {version}')
