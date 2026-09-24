#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'src/css/components/chrono.css').read_text('utf-8')
fail=[]
# Whole-section filter/backdrop blur are expensive rasterization triggers.
block=css[css.find('.chronologie-container.is-enhanced'):css.find('.chronologie-container::before')]
if 'filter: drop-shadow' in block: fail.append('whole chronology section still uses filter: drop-shadow')
share=css[css.find('.chrono-share-panel'):css.find('.chronologie-container .share-text')]
if 'backdrop-filter: blur' in share or 'backdrop-filter:blur' in share: fail.append('chronology share panel still uses backdrop-filter blur')
if fail:
    print('FAIL - chronology performance');[print('-',x) for x in fail];raise SystemExit(1)
print('PASS - chronology avoids full-surface filter/backdrop compositing')
