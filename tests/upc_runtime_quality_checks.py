#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
text=(root/'src/js/components/UPC.js').read_text('utf-8',errors='replace')
fail=[]
if "card.addEventListener('keydown'" in text:
    fail.append('UPC should delegate keyboard handling to the carousel container instead of one listener per card')
if "container.addEventListener('keydown'" not in text:
    fail.append('UPC is missing delegated keyboard handling')
if "resetCardState(incoming);\n            resetCardState(incoming);" in text:
    fail.append('UPC nextCard resets the same incoming card twice')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - UPC runtime quality checks passed')
