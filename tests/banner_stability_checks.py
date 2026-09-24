#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
css = (ROOT / 'src/css/banner/01-banner-core.css').read_text('utf-8')
fail = []

m = re.search(r'\.image-group\s*\{(?P<body>.*?)\}', css, re.S)
if not m:
    fail.append('.image-group rule missing')
else:
    body = m.group('body')
    if 'animation: bannerImageReveal' not in body:
        fail.append('.image-group must use position-stable bannerImageReveal animation')
    if 'fadeInRight' in body:
        fail.append('.image-group must not use horizontal/transform entrance animation')

km = re.search(r'@keyframes\s+bannerImageReveal\s*\{(?P<body>.*?)\n\}', css, re.S)
if not km:
    fail.append('bannerImageReveal keyframes missing')
else:
    keyframes = km.group('body')
    if re.search(r'\btransform\s*:', keyframes):
        fail.append('bannerImageReveal must never animate transform/position')
    if 'opacity' not in keyframes:
        fail.append('bannerImageReveal should be opacity-only')

if fail:
    print('FAIL')
    for item in fail:
        print('-', item)
    raise SystemExit(1)
print('PASS - banner image reveal is position-stable')
