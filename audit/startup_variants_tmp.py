from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from browser_smoke import inline_document,chromium_executable
from playwright.sync_api import sync_playwright
base=inline_document(Path('site'))
probe="""<script>window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:'longtask',buffered:true})}catch(e){}</script>"""
variants={
'base':'',
'hide_below':'.trending-master-container,.comentarii-section,#mainContent,.chronologie-container,#avEntertainmentCarousels,.av-footer,.share-banner-section{display:none!important}',
'hide_banner_fx':'.banner .bg-gradient,.banner .bg-radial,.banner .bg-line,.banner .bg-grid,.banner .bubble,.banner .red-glow,.banner .scan-light,.banner .gooey-ring,.banner .particle,.banner .spark,.banner .light-streak{display:none!important}',
'hide_header_banner_decor':'.backdrop,.header-fx,.banner .bg-gradient,.banner .bg-radial,.banner .bg-line,.banner .bg-grid,.banner .bubble,.banner .red-glow,.banner .scan-light,.banner .gooey-ring,.banner .particle,.banner .spark,.banner .light-streak{display:none!important}',
'hide_banner_content_except_image':'.banner-left,.slider-nav,.banner .info-button,.banner .info-tooltip{display:none!important}',
'only_shell':'.page,.trending-master-container,.comentarii-section,#mainContent,.chronologie-container,#avEntertainmentCarousels,.av-footer,.share-banner-section{display:none!important}',
}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=chromium_executable(),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,css in variants.items():
  vals=[]
  for i in range(2):
   pg=b.new_page(viewport={'width':390,'height':844})
   doc=base.replace('<head>','<head>'+probe+(f'<style>{css}</style>' if css else ''),1)
   pg.set_content(doc,wait_until='load',timeout=60000);pg.wait_for_timeout(900)
   lt=pg.evaluate('window.__lt')
   vals.append((round(sum(lt),1),len(lt),round(max(lt or [0]),1),pg.evaluate('document.querySelectorAll("*").length')))
   pg.close()
  print(name,vals)
 b.close()
