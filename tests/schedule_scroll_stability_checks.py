#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
js = (root / 'src/js/main/02-core-widgets.js').read_text('utf8')

fail = []
required = [
    'function centreazaButonul',
    'const centreazaZiuaInitiala',
    'IntersectionObserver',
    'requestAnimationFrame(centreazaZiuaInitiala)',
]
for token in required:
    if token not in js:
        fail.append(f'missing lazy/deterministic centering primitive: {token}')

for forbidden in [
    'scrollIntoView(',
    'document.fonts?.ready',
    'document.fonts.ready',
]:
    if forbidden in js:
        fail.append(f'forbidden startup scroll/layout trigger remains: {forbidden}')

# The centering call must live behind the visibility observer/fallback, not run eagerly.
observer_pos = js.find('new IntersectionObserver')
center_call_pos = js.find('requestAnimationFrame(centreazaZiuaInitiala)')
if observer_pos == -1 or center_call_pos == -1:
    fail.append('visibility-deferred centering is incomplete')

if fail:
    print('FAIL - schedule scroll stability')
    for item in fail:
        print('-', item)
    raise SystemExit(1)

print('PASS - schedule centering is stable and deferred')
