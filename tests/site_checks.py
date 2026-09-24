#!/usr/bin/env python3
import argparse, sys, subprocess
from pathlib import Path
from bs4 import BeautifulSoup

PLACEHOLDERS=('pagina_ta_aici','link_catre_','link-read.html')

def check(root: Path):
    failures=[]
    index=root/'index.html'
    if not index.exists(): return ['index.html lipsește']
    html=index.read_text('utf-8',errors='replace')
    soup=BeautifulSoup(html,'html.parser')

    ids={}
    for t in soup.find_all(attrs={'id':True}): ids[t['id']]=ids.get(t['id'],0)+1
    dup=[k for k,v in ids.items() if v>1]
    if dup: failures.append(f'ID-uri duplicate: {dup[:10]}')

    for tag,attr in [('link','href'),('script','src'),('img','src'),('source','src')]:
        for el in soup.find_all(tag):
            v=el.get(attr)
            if not v or v.startswith(('http://','https://','//','data:','blob:')): continue
            p=v.split('?',1)[0].split('#',1)[0]
            if p and not p.startswith('/') and not (root/p).exists():
                failures.append(f'Resursă locală lipsă: {tag}[{attr}]={v}')

    inline=[]
    for t in soup.find_all(True):
        for a in t.attrs:
            if a.lower().startswith('on'):
                inline.append((t.name,a,getattr(t,'sourceline',None)))
    if inline: failures.append(f'Event handlers inline: {len(inline)}')

    badblank=[]
    for a in soup.find_all('a',target='_blank'):
        rel=set(a.get('rel',[]))
        if not {'noopener','noreferrer'}.issubset(rel): badblank.append(a.get('href'))
    if badblank: failures.append(f'target=_blank fără noopener+noreferrer: {len(badblank)}')

    csp=soup.find('meta',attrs={'http-equiv':lambda v: v and v.lower()=='content-security-policy'})
    if not csp: failures.append('CSP meta lipsește')
    ref=soup.find('meta',attrs={'name':lambda v: v and v.lower()=='referrer'})
    if not ref: failures.append('Referrer policy meta lipsește')

    href_values=[a.get('href','') for a in soup.find_all('a')]
    badph=[p for p in PLACEHOLDERS if any((href==p or href.startswith(p)) for href in href_values)]
    if badph: failures.append('Linkuri placeholder active încă prezente: '+', '.join(badph))

    hash_bad=[a for a in soup.find_all('a',href='#') if a.get('aria-disabled')!='true']
    if hash_bad: failures.append(f'Linkuri # nemarcate disabled: {len(hash_bad)}')

    missing_alt=[i for i in soup.find_all('img') if not i.has_attr('alt')]
    if missing_alt: failures.append(f'Imagini fără alt: {len(missing_alt)}')

    unlabeled=[]
    for b in soup.find_all('button'):
        if not b.get_text(' ',strip=True) and not b.get('aria-label') and not b.get('title'):
            unlabeled.append(b)
    if unlabeled: failures.append(f'Butoane fără nume accesibil: {len(unlabeled)}')

    for p in sorted((root/'assets'/'js').glob('*.js')) if (root/'assets'/'js').exists() else []:
        proc=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
        if proc.returncode: failures.append(f'JS invalid: {p.name}: {proc.stderr.strip()}')
    return failures

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--root',required=True)
    args=ap.parse_args(); root=Path(args.root)
    failures=check(root)
    if failures:
        print('FAIL')
        for f in failures: print('-',f)
        sys.exit(1)
    print('PASS - verificările de producție au trecut')
