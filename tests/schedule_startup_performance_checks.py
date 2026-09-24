#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'src/js/main/02-core-widgets.js').read_text('utf-8')
fail=[]
legacy='''  centreazaZiuaInitiala();\n  requestAnimationFrame(centreazaZiuaInitiala);'''
if legacy in js:
    fail.append('schedule still centers synchronously during DOMContentLoaded')
if 'IntersectionObserver' not in js:
    fail.append('schedule initial centering should be deferred until the section nears the viewport')
if 'document.fonts?.ready' in js or 'document.fonts.ready' in js:
    fail.append('schedule startup must not wait on document.fonts.ready')
if fail:
    print('FAIL')
    [print('-',x) for x in fail]
    raise SystemExit(1)
print('PASS - schedule startup centering is deferred')
