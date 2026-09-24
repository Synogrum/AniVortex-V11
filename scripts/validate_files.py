#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
from bs4 import BeautifulSoup
import tinycss2, subprocess, csv, xml.etree.ElementTree as ET, sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'site'
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[1]/'audit'/'validation-final.tsv'
rows=[]
for p in sorted(x for x in root.rglob('*') if x.is_file()):
    rel=p.relative_to(root).as_posix(); ext=p.suffix.lower(); status='OK'; detail='readable'
    try:
        if ext in {'.png','.jpg','.jpeg','.webp','.gif'}:
            with Image.open(p) as im:
                im.verify(); detail=f'image verified {im.format}'
        elif ext=='.svg':
            ET.parse(p); detail='SVG/XML parsed'
        elif ext in {'.xml'}:
            ET.parse(p); detail='XML parsed'
        elif ext=='.html':
            BeautifulSoup(p.read_text('utf-8',errors='strict'),'html.parser'); detail='HTML parsed'
        elif ext=='.css':
            parsed=tinycss2.parse_stylesheet(p.read_text('utf-8',errors='strict'),skip_comments=False,skip_whitespace=False)
            errs=[x for x in parsed if x.type=='error']
            if errs: raise ValueError(errs[0].message)
            detail='CSS parsed'
        elif ext=='.js':
            r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
            if r.returncode: raise ValueError(r.stderr.strip())
            detail='JS syntax OK'
        else:
            with p.open('rb') as f: f.read(64)
            detail='binary/text readable'
    except Exception as exc:
        status='ERROR'; detail=str(exc).replace('\t',' ').replace('\n',' ')[:500]
    rows.append([rel,ext,status,detail,p.stat().st_size])
out.parent.mkdir(parents=True,exist_ok=True)
with out.open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f,delimiter='\t'); w.writerow(['path','ext','status','detail','bytes']); w.writerows(rows)
errors=[r for r in rows if r[2]!='OK']
print(f'validated={len(rows)} errors={len(errors)} report={out}')
for r in errors[:20]: print(r)
raise SystemExit(1 if errors else 0)
