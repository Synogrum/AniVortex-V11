#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'site'
soup=BeautifulSoup((root/'index.html').read_text('utf-8',errors='replace'),'html.parser')
fail=[]
for b in soup.find_all('button'):
    if not b.get('type'):
        fail.append(f'button without type at line {b.sourceline}')
for inp in soup.find_all('input', attrs={'type':'text'}):
    labelled=bool(inp.get('aria-label') or inp.get('aria-labelledby') or inp.find_parent('label'))
    if not labelled: fail.append(f'text input without accessible name at line {inp.sourceline}')
for a in soup.find_all('a', attrs={'aria-disabled':'true'}):
    if a.get('tabindex')!='-1': fail.append(f'disabled link remains in tab order at line {a.sourceline}')
if fail:
    print('FAIL')
    for f in fail[:80]: print('-',f)
    if len(fail)>80: print(f'... {len(fail)-80} more')
    raise SystemExit(1)
print('PASS - accessibility checks passed')
