from pathlib import Path
import sys,json
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
site=Path('site');doc=inline_document(site)
selectors=['.banner-wrap','#trendingMaster','.comentarii-section','#mainContent','.chronologie-container','#avEntertainmentCarousels','footer']
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1366,'height':768});page.set_content(doc,wait_until='load');page.wait_for_timeout(800)
 for sel in selectors:
  if not page.locator(sel).count():continue
  v=page.locator(sel).first.evaluate('''el=>{const all=[el,...el.querySelectorAll('*')];let anim=0,filter=0,backdrop=0,shadow=0;for(const n of all){const s=getComputedStyle(n);if(s.animationName&&s.animationName!=='none')anim++;if(s.filter&&s.filter!=='none')filter++;if(s.backdropFilter&&s.backdropFilter!=='none')backdrop++;if(s.boxShadow&&s.boxShadow!=='none')shadow++;}const r=el.getBoundingClientRect();return {nodes:all.length,anim,filter,backdrop,shadow,h:Math.round(r.height),w:Math.round(r.width)}}''')
  print(sel,v)
 b.close()
