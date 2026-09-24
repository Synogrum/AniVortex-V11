from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
parts=root/'src/html/index'
html='\n'.join(p.read_text('utf-8') for p in sorted(parts.glob('*.html')))
soup=BeautifulSoup(html,'html.parser')
toggles=soup.select('.dropdown-toggle')
assert toggles, 'No filter dropdown toggles found'
assert all(t.name == 'button' for t in toggles), 'All .dropdown-toggle controls must be native buttons'
assert all(t.get('type') == 'button' for t in toggles), 'Filter dropdown buttons need type=button'
js=(root/'src/js/components/header.js').read_text('utf-8')
assert 'setAttribute("role", "button")' not in js, 'Native buttons must not receive redundant role=button'
assert 'setAttribute("tabindex", "0")' not in js, 'Native buttons must not receive redundant tabindex=0'
print(f'NATIVE FILTER CONTROLS PASS - {len(toggles)} native buttons')
