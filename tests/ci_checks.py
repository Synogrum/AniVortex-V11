#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
workflow=root/'.github/workflows/verify.yml'
fail=[]
if not workflow.exists():
    fail.append('GitHub Actions verify workflow is missing')
else:
    text=workflow.read_text('utf-8',errors='replace')
    for token in ['actions/checkout@v4','actions/setup-python@v5','actions/setup-node@v4','python -m playwright install --with-deps chromium','python scripts/verify.py']:
        if token not in text: fail.append(f'CI workflow missing: {token}')
if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - CI workflow checks passed')
