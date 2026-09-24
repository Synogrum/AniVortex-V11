#!/usr/bin/env python3
"""Conservatively remove superseded CSS layout/typography declarations.

A declaration is removable when a later *separate* rule in the same file has:
- the exact same selector text;
- the exact same at-rule context;
- the same property;
- exactly one declaration of that property in each involved rule.

Only low-risk layout/typography properties are pruned. Visual/fallback-sensitive
properties (background, display, filters, animations, etc.) are intentionally kept.
"""
from __future__ import annotations
from dataclasses import dataclass
from collections import defaultdict
from pathlib import Path
import argparse, re

ROOT=Path(__file__).resolve().parents[1]

SAFE_PROPS={
 'font-size','font-weight','line-height','letter-spacing','text-align','white-space',
 'width','height','min-width','min-height','max-width','max-height',
 'margin','margin-top','margin-right','margin-bottom','margin-left',
 'padding','padding-top','padding-right','padding-bottom','padding-left',
 'gap','row-gap','column-gap','border-radius',
 'top','right','bottom','left','inset','inset-block','inset-inline',
 'z-index','flex','flex-basis','flex-grow','flex-shrink',
 'grid-template-columns','grid-template-rows','grid-column','grid-row',
 'align-items','align-content','justify-items','justify-content','place-items',
 'overflow','overflow-x','overflow-y','object-position','aspect-ratio',
 'color','opacity','box-shadow','border','border-color','border-width','border-style',
 'transform','transform-origin','transition','transition-duration','transition-delay',
 'animation','animation-duration','animation-delay','animation-timing-function',
 'text-transform','pointer-events','visibility','cursor','outline','outline-color',
 'object-fit','box-sizing',
}

@dataclass
class Decl:
    file: Path
    context: tuple[str,...]
    selector: str
    prop: str
    value: str
    rule_id: int
    start: int
    end: int


def skip_comment(s,i,end):
    j=s.find('*/',i+2,end)
    return end if j<0 else j+2

def skip_string(s,i,end):
    quote=s[i]; i+=1
    while i<end:
        if s[i]=='\\': i+=2; continue
        if s[i]==quote: return i+1
        i+=1
    return end

def find_matching_brace(s,open_i,end):
    depth=1; i=open_i+1
    while i<end:
        if s.startswith('/*',i): i=skip_comment(s,i,end); continue
        if s[i] in ('"',"'"): i=skip_string(s,i,end); continue
        if s[i]=='{': depth+=1
        elif s[i]=='}':
            depth-=1
            if depth==0: return i
        i+=1
    raise ValueError(f'unclosed CSS block at {open_i}')

def normalize_header(h):
    return re.sub(r'\s+',' ',h.strip())

def first_non_ws_comment(s,a,b):
    i=a
    while i<b:
        if s[i].isspace(): i+=1; continue
        if s.startswith('/*',i): i=skip_comment(s,i,b); continue
        return i
    return b

def find_colon(s,a,b):
    i=a; par=br=0
    while i<b:
        if s.startswith('/*',i): i=skip_comment(s,i,b); continue
        if s[i] in ('"',"'"): i=skip_string(s,i,b); continue
        ch=s[i]
        if ch=='(': par+=1
        elif ch==')' and par: par-=1
        elif ch=='[': br+=1
        elif ch==']' and br: br-=1
        elif ch==':' and par==0 and br==0: return i
        i+=1
    return -1

def parse_decls(s,a,b,file,context,selector,rule_id):
    out=[]; stmt=a; i=a; par=br=0
    while i<=b:
        at_end=i==b
        if not at_end and s.startswith('/*',i): i=skip_comment(s,i,b); continue
        if not at_end and s[i] in ('"',"'"): i=skip_string(s,i,b); continue
        ch=';' if at_end else s[i]
        if not at_end:
            if ch=='(': par+=1
            elif ch==')' and par: par-=1
            elif ch=='[': br+=1
            elif ch==']' and br: br-=1
        if (ch==';' and par==0 and br==0) or at_end:
            seg_end=i
            ns=first_non_ws_comment(s,stmt,seg_end)
            if ns<seg_end:
                colon=find_colon(s,ns,seg_end)
                if colon>ns:
                    prop=s[ns:colon].strip().lower()
                    # Ignore malformed/nested syntax and custom/vendor properties.
                    if re.fullmatch(r'(?:--)?[A-Za-z_][\w-]*|-[A-Za-z_][\w-]*',prop):
                        value=s[colon+1:seg_end].strip()
                        end=i+1 if not at_end else i
                        out.append(Decl(file,context,selector,prop,value,rule_id,ns,end))
            stmt=i+1
        i+=1
    return out

def parse_range(s,start,end,file,context,counter,out):
    stmt=start; i=start
    while i<end:
        if s.startswith('/*',i): i=skip_comment(s,i,end); continue
        if s[i] in ('"',"'"): i=skip_string(s,i,end); continue
        ch=s[i]
        if ch==';': stmt=i+1; i+=1; continue
        if ch=='{':
            raw_header=s[stmt:i]
            header=normalize_header(re.sub(r'/\*.*?\*/','',raw_header,flags=re.S))
            close=find_matching_brace(s,i,end)
            if header:
                if header.startswith('@'):
                    low=header.lower()
                    if not any(low.startswith(x) for x in ('@keyframes','@-webkit-keyframes','@font-face','@page','@property','@counter-style')):
                        parse_range(s,i+1,close,file,context+(header,),counter,out)
                else:
                    rid=counter[0]; counter[0]+=1
                    out.extend(parse_decls(s,i+1,close,file,context,header,rid))
            stmt=close+1; i=close+1; continue
        i+=1

def analyze(path:Path, all_properties=False):
    s=path.read_text('utf8')
    decls=[]; parse_range(s,0,len(s),path,(),[0],decls)
    groups=defaultdict(list)
    for d in decls:
        if all_properties or d.prop in SAFE_PROPS:
            groups[(d.context,d.selector,d.prop)].append(d)
    removals=[]
    for items in groups.values():
        by_rule=defaultdict(list)
        for d in items: by_rule[d.rule_id].append(d)
        rule_ids=sorted(by_rule)
        if len(rule_ids)<2: continue
        # For the low-risk SAFE_PROPS, any later exact-selector declaration supersedes
        # every declaration of that property in earlier separate rules.
        final=by_rule[rule_ids[-1]][-1]
        for rid in rule_ids[:-1]:
            for old in by_rule[rid]:
                removals.append((old,final))
    return s,removals

def process(path:Path,apply:bool,all_properties=False):
    s,rems=analyze(path,all_properties)
    if apply and rems:
        for old,_ in sorted(rems,key=lambda x:x[0].start,reverse=True):
            s=s[:old.start]+s[old.end:]
        path.write_text(s,'utf8')
    return rems

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--apply',action='store_true'); ap.add_argument('--all-properties',action='store_true'); ap.add_argument('--report',type=Path,default=ROOT/'audit/css-overrides-pruned.tsv')
    args=ap.parse_args(); rows=[]
    for path in sorted((ROOT/'src/css').rglob('*.css')):
        for old,final in process(path,args.apply,args.all_properties):
            rows.append((path.relative_to(ROOT).as_posix(),' > '.join(old.context),old.selector,old.prop,old.value,final.value,old.rule_id,final.rule_id))
    args.report.parent.mkdir(parents=True,exist_ok=True)
    with args.report.open('w',encoding='utf8') as f:
        f.write('file\tcontext\tselector\tproperty\told_value\tfinal_value\told_rule\tfinal_rule\n')
        for row in rows: f.write('\t'.join(str(x).replace('\t',' ').replace('\n',' ') for x in row)+'\n')
    print(f'candidates={len(rows)} apply={args.apply} report={args.report}')
if __name__=='__main__': main()
