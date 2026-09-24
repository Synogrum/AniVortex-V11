from pathlib import Path
import sys, json
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'scripts'))
from browser_smoke import inline_document, chromium_executable
from playwright.sync_api import sync_playwright
site=Path('/mnt/data/AniVortex_FINAL_OPTIMIZED_V10/site')
doc=inline_document(site)
probe='''<script>
window.__lt=[];
try{new PerformanceObserver(list=>{for(const e of list.getEntries()) window.__lt.push({start:e.startTime,duration:e.duration,name:e.name});}).observe({type:'longtask', buffered:true});}catch(e){}
</script>'''
doc=doc.replace('<head>', '<head>'+probe,1)
sections=[
 ('top','.banner-wrap'),('trending','#trendingMaster'),('comments','.comentarii-section'),('main','#mainContent'),('chrono','.chronologie-container'),('entertainment','#avEntertainmentCarousels'),('footer','footer')
]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True, executable_path=chromium_executable(), args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(390,844),(1366,768)]:
  page=b.new_page(viewport={'width':w,'height':h})
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(doc,wait_until='load',timeout=60000)
  page.wait_for_timeout(900)
  startup=page.evaluate('window.__lt.splice(0)')
  def animstats():
   return page.evaluate('''() => {const a=document.getAnimations();let running=0,visible=0;for(const x of a){if(x.playState==='running'){running++;const t=x.effect&&x.effect.target;if(t&&t.getBoundingClientRect){const r=t.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth)visible++;}}}return {running,visible,nodes:document.querySelectorAll('*').length,scrollH:document.documentElement.scrollHeight}}''')
  print('VIEW',w,h,'startup_longtasks',sum(x['duration'] for x in startup),len(startup),'max',max([x['duration'] for x in startup] or [0]),'anim',animstats(),'errors',errs)
  for name,sel in sections:
   if page.locator(sel).count()==0: continue
   page.evaluate('window.__lt.splice(0)')
   page.locator(sel).first.evaluate("el=>el.scrollIntoView({block:'center',behavior:'instant'})")
   page.wait_for_timeout(700)
   lt=page.evaluate('window.__lt.splice(0)')
   print(' ',name,'LT',round(sum(x['duration'] for x in lt),1),len(lt),'max',round(max([x['duration'] for x in lt] or [0]),1),'anim',animstats())
  page.close()
 b.close()
