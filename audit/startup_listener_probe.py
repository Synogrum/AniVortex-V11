from pathlib import Path
import sys,json
sys.path.insert(0,'/mnt/data/AniVortex_FINAL_OPTIMIZED_V10/scripts')
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
site=Path('/mnt/data/AniVortex_FINAL_OPTIMIZED_V10/site');doc=inline_document(site)
probe=r'''<script>
window.__listenerTimes=[];
(()=>{const orig=EventTarget.prototype.addEventListener;let id=0;EventTarget.prototype.addEventListener=function(type,cb,opts){
 if((type==='DOMContentLoaded'||type==='load')&&typeof cb==='function'){
   const n=++id; const label=(cb.name||'anon')+' '+String(cb).slice(0,100).replace(/\s+/g,' ');
   const wrapped=function(...args){const t=performance.now();try{return cb.apply(this,args)}finally{const d=performance.now()-t;window.__listenerTimes.push({id:n,type,label,d});}};
   return orig.call(this,type,wrapped,opts);
 }
 return orig.call(this,type,cb,opts);
};})();
</script>'''
doc=doc.replace('<head>','<head>'+probe,1)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox'])
 for w,h in [(390,844),(1366,768)]:
  page=b.new_page(viewport={'width':w,'height':h});page.set_content(doc,wait_until='load');page.wait_for_timeout(1000)
  arr=page.evaluate('window.__listenerTimes.slice().sort((a,b)=>b.d-a.d)')
  print('\nVIEW',w,h)
  for x in arr[:30]:
   if x['d']>=1: print(round(x['d'],1),x['type'],x['label'][:180])
  page.close()
 b.close()
