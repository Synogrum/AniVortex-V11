from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
parts=root/'src/html/index'
html='\n'.join(p.read_text('utf-8') for p in sorted(parts.glob('*.html')))
soup=BeautifulSoup(html,'html.parser')
skip=soup.select_one('a.skip-link[href="#mainContent"]')
assert skip, 'Skip link to #mainContent missing'
main=soup.select_one('main#mainContent')
assert main, 'Main landmark needs id=mainContent'
css='\n'.join(p.read_text('utf-8') for p in (root/'src/css').rglob('*.css'))
assert '.skip-link' in css and '.skip-link:focus' in css, 'Skip link focus styles missing'
print('SKIP LINK CHECKS PASS')
