#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
fail = []

trending = (root / 'src/js/components/trending.js').read_text('utf-8', errors='replace')
if trending.count('new MutationObserver') > 1:
    fail.append('Trending decorative effects should share one MutationObserver')

favorites = (root / 'src/js/main/01-favorites.js').read_text('utf-8', errors='replace')
if 'AniVortexPopup.bindViewportTracking' not in favorites:
    fail.append('Favorite popup should use the shared viewport-tracking popup manager')

episode = (root / 'src/js/main/05-episode-popup.js').read_text('utf-8', errors='replace')
if 'AniVortexPopup.bindViewportTracking' not in episode:
    fail.append('Episode popup should use the shared viewport-tracking popup manager')

upc = (root / 'src/js/components/UPC.js').read_text('utf-8', errors='replace')
if "card.setAttribute('aria-controls'" not in upc:
    fail.append('UPC cards should expose aria-controls for their generated popup')
if "card.setAttribute('aria-haspopup', 'dialog')" not in upc:
    fail.append('UPC cards should expose aria-haspopup=dialog')

# Carousel interaction handlers must be centralized and autoplay must pause for keyboard users.
render_match = re.search(r"function renderCards\(category\) \{(?P<body>.*?)\n\}\n\n// ── Slide", trending, re.S)
if render_match and 'addEventListener' in render_match.group('body'):
    fail.append('Trending renderCards must not register listeners on every rerender')
if 'AniVortexCarousel.bindInteractionPause' not in trending:
    fail.append('Trending carousel should use shared interaction pause handling')

if "event.key === 'ArrowLeft'" not in upc or "event.key === 'ArrowRight'" not in upc:
    fail.append('UPC carousel cards should support ArrowLeft/ArrowRight navigation')
if 'AniVortexCarousel.bindInteractionPause' not in upc:
    fail.append('UPC carousel should use shared interaction pause handling')

banner = (root / 'src/js/components/banner.js').read_text('utf-8', errors='replace')
if 'AniVortexCarousel.bindInteractionPause' not in banner:
    fail.append('Banner should use shared interaction pause handling')

suggestions = (root / 'src/js/main/07-top-suggestions.js').read_text('utf-8', errors='replace')
if 'AniVortexCarousel.bindInteractionPause' not in suggestions:
    fail.append('Top suggestions should use shared interaction pause handling')

if fail:
    print('FAIL')
    for item in fail:
        print('-', item)
    raise SystemExit(1)

print('PASS - runtime refinement checks passed')
