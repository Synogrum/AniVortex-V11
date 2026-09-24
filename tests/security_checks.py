#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import re, sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'site'
failures = []

html = (root / 'index.html').read_text('utf-8', errors='replace')
soup = BeautifulSoup(html, 'html.parser')

csp = soup.find('meta', attrs={'http-equiv': lambda v: v and v.lower() == 'content-security-policy'})
content = csp.get('content', '') if csp else ''
required = [
    "script-src 'self'",
    "script-src-attr 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
]
for directive in required:
    if directive not in content:
        failures.append(f'CSP missing/weak directive: {directive}')

# Inline JS handlers generated from template strings are still inline script and
# would either be blocked by CSP or become an XSS sink if CSP is relaxed later.
handler_pattern = re.compile(r'\bon(?:error|load|click|mouseover|focus|submit)\s*=', re.I)
for js in sorted((root / 'assets' / 'js').glob('*.js')):
    text = js.read_text('utf-8', errors='replace')
    if handler_pattern.search(text):
        failures.append(f'Inline event-handler markup in JS: {js.name}')

# No dangerous dynamic execution primitives in production JS.
for js in sorted((root / 'assets' / 'js').glob('*.js')):
    text = js.read_text('utf-8', errors='replace')
    for pattern, label in [
        (r'\beval\s*\(', 'eval()'),
        (r'\bnew\s+Function\s*\(', 'new Function()'),
        (r'\bdocument\.write\s*\(', 'document.write()'),
    ]:
        if re.search(pattern, text):
            failures.append(f'{label} found in {js.name}')

if failures:
    print('FAIL')
    for failure in failures:
        print('-', failure)
    raise SystemExit(1)

print('PASS - security checks passed')
