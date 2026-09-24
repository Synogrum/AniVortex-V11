from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
site=Path('site');doc=inline_document(site)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':1366,'height':768});pg.set_content(doc,wait_until='load');pg.wait_for_timeout(500)
 for sel in ['.comentarii-section','#mainContent','.chronologie-container','.av-footer']:
  if not pg.locator(sel).count(): continue
  print('\n',sel)
  rows=pg.locator(sel).first.evaluate('''el=>{let out=[];for(const n of [el,...el.querySelectorAll('*')]){const s=getComputedStyle(n);if((s.filter&&s.filter!=='none')||(s.backdropFilter&&s.backdropFilter!=='none')||(s.boxShadow&&s.boxShadow!=='none')){out.push({tag:n.tagName,cl:n.className||'',id:n.id||'',filter:s.filter,backdrop:s.backdropFilter,shadow:s.boxShadow})}}return out.slice(0,120)}''')
  for r in rows: print(r)
 b.close()
