from pathlib import Path
import sys
sys.path.insert(0,'/mnt/data/AniVortex_FINAL_OPTIMIZED_V10/scripts')
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
base=inline_document(Path('/mnt/data/AniVortex_FINAL_OPTIMIZED_V10/site'))
probe=r'''<script>
window.__ioTimes=[];(()=>{const O=window.IntersectionObserver;let n=0;window.IntersectionObserver=function(cb,opt){const id=++n;const label=String(cb).slice(0,140).replace(/\s+/g,' ');return new O((entries,obs)=>{const t=performance.now();try{return cb(entries,obs)}finally{window.__ioTimes.push({id,label,d:performance.now()-t,entries:entries.length})}},opt)};window.IntersectionObserver.prototype=O.prototype;})();
window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:'longtask',buffered:true})}catch(e){}
</script>'''
doc=base.replace('<head>','<head>'+probe,1)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox'])
 for w,h in [(390,844),(1366,768)]:
  page=b.new_page(viewport={'width':w,'height':h});page.set_content(doc,wait_until='load');page.wait_for_timeout(900);page.evaluate('window.__ioTimes=[];window.__lt=[]');page.locator('#mainContent').evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");page.wait_for_timeout(800);print('\nVIEW',w,'LT',page.evaluate('window.__lt'),'IO',page.evaluate('window.__ioTimes.sort((a,b)=>b.d-a.d)'));page.close()
 b.close()
