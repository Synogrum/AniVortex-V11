#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
manager=(root/'src/js/components/carousel-manager.js').read_text('utf-8',errors='replace')
banner=(root/'src/js/components/banner.js').read_text('utf-8',errors='replace')
css='\n'.join(p.read_text('utf-8',errors='replace') for p in sorted((root/'src/css/banner').glob('*.css')))
fail=[]
if 'bindSwipe' not in manager: fail.append('Carousel manager missing bindSwipe')
if 'AniVortexCarousel.bindSwipe' not in banner: fail.append('Banner does not use shared swipe handling')
if 'touch-action: pan-y' not in css: fail.append('Banner CSS should preserve vertical touch scrolling during horizontal swipe')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - shared swipe checks passed')
