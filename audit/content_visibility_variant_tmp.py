from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
base=inline_document(Path('site'))
probe='<script>window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:"longtask",buffered:true})}catch(e){}</script>'
csses={
'base':'',
'cv_sections':'.trending-master-container,.comentarii-section,#mainContent,.chronologie-container,#avEntertainmentCarousels,.share-banner-section,.av-footer{content-visibility:auto;contain-intrinsic-size:auto 800px}',
'cv_safe':'.comentarii-section,.chronologie-container,.share-banner-section,.av-footer{content-visibility:auto;contain-intrinsic-size:auto 700px}',
'cv_main':'#mainContent{content-visibility:auto;contain-intrinsic-size:auto 3800px}',
'cv_trending':'#trendingMaster{content-visibility:auto;contain-intrinsic-size:auto 550px}',
}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,css in csses.items():
  vals=[]
  for i in range(3):
   pg=b.new_page(viewport={'width':390,'height':844})
   doc=base.replace('<head>','<head>'+probe+(f'<style>{css}</style>' if css else ''),1)
   pg.set_content(doc,wait_until='load');pg.wait_for_timeout(800)
   lt=pg.evaluate('window.__lt'); vals.append((round(sum(lt),1),round(max(lt or [0]),1),pg.evaluate('document.documentElement.scrollHeight')));pg.close()
  print(name,vals)
 b.close()
