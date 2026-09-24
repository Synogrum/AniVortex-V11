#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
errors=[]
for p in (ROOT/'src'/'html').rglob('*.html'):
    text=p.read_text(encoding='utf-8')
    if re.search(r'(?i)src=["\'][^"\']+\.gif(?:\?[^"\']*)?["\']', text):
        errors.append(f'{p.relative_to(ROOT)} still references GIF')

asset=ROOT/'site/public/user/profil img/sung jin woo.webp'
if not asset.exists():
    errors.append('optimized animated WebP is missing')
elif asset.stat().st_size > 500_000:
    errors.append(f'optimized animated WebP is too large: {asset.stat().st_size} bytes')

if errors:
    print('\n'.join('FAIL: '+e for e in errors))
    raise SystemExit(1)
print('PASS: heavy animated asset is optimized and source HTML has no GIF references')
