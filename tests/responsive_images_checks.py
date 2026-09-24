from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'src/html/index/00-shell-header-banner.html').read_text(encoding='utf-8')
site = root / 'site'
errors = []

hero_tags = re.findall(r'<img\b[^>]*class="hero-image"[^>]*>', html)
if len(hero_tags) < 10:
    errors.append(f'expected at least 10 banner hero images, found {len(hero_tags)}')

for tag in hero_tags:
    src_match = re.search(r'src="([^"]+)"', tag)
    if not src_match:
        errors.append('hero image missing src')
        continue
    src = src_match.group(1)
    if 'srcset=' not in tag or 'sizes=' not in tag:
        errors.append(f'{src} missing srcset/sizes')
        continue
    stem = Path(src).stem
    for width in (600, 900):
        candidate = site / 'public/imgs/banner/responsive' / f'{stem}-{width}.webp'
        if not candidate.exists():
            errors.append(f'missing responsive banner variant: {candidate.relative_to(root)}')


preload = re.search(r'<link\b[^>]*rel="preload"[^>]*href="public/imgs/banner/naruto\.webp"[^>]*>', html)
if not preload or 'imagesrcset=' not in preload.group(0) or 'imagesizes=' not in preload.group(0):
    errors.append('first banner preload should use imagesrcset/imagesizes for responsive loading')

if errors:
    print('\n'.join(f'FAIL: {e}' for e in errors))
    raise SystemExit(1)
print('PASS - banner hero images use responsive srcset variants')
