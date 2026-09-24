#!/usr/bin/env python3
"""Find/remove high-confidence dead CSS selector branches.

A selector branch is considered impossible only when it requires a class or ID that
is absent from every HTML/JS source and does not match a detected dynamic class/id
prefix used by JavaScript templates/concatenation.
"""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import argparse, re

ROOT=Path(__file__).resolve().parents[1]

@dataclass
class RuleSpan:
    file: Path
    header_start: int
    header_end: int
    block_end: int
    selector: str


def skip_comment(s,i,end):
    j=s.find('*/',i+2,end); return end if j<0 else j+2

def skip_string(s,i,end):
    q=s[i]; i+=1
    while i<end:
        if s[i]=='\\': i+=2; continue
        if s[i]==q: return i+1
        i+=1
    return end

def find_close(s,open_i,end):
    d=1; i=open_i+1
    while i<end:
        if s.startswith('/*',i): i=skip_comment(s,i,end); continue
        if s[i] in ('"',"'"): i=skip_string(s,i,end); continue
        if s[i]=='{': d+=1
        elif s[i]=='}':
            d-=1
            if d==0:return i
        i+=1
    raise ValueError(f'unclosed block at {open_i}')

def collect_rules(s,start,end,file,out):
    stmt=start; i=start
    while i<end:
        if s.startswith('/*',i): i=skip_comment(s,i,end); continue
        if s[i] in ('"',"'"): i=skip_string(s,i,end); continue
        if s[i]==';': stmt=i+1; i+=1; continue
        if s[i]=='{':
            hs=stmt; he=i; raw=s[hs:he]; close=find_close(s,i,end)
            # Comments may sit immediately before an @media/rule. They are not part of the header.
            header=re.sub(r'/\*.*?\*/','',raw,flags=re.S).strip()
            if header:
                low=header.lower()
                if header.startswith('@'):
                    if not any(low.startswith(x) for x in ('@keyframes','@-webkit-keyframes','@font-face','@page','@property','@counter-style')):
                        collect_rules(s,i+1,close,file,out)
                else:
                    # Rewrite only the selector text, preserving comments/whitespace before it.
                    rel=raw.rfind(header)
                    selector_start=hs+rel if rel>=0 else hs
                    out.append(RuleSpan(file,selector_start,selector_start+len(header),close+1,header))
            stmt=close+1; i=close+1; continue
        i+=1

def split_selector_list(selector):
    parts=[]; start=0; par=br=0; i=0
    while i<len(selector):
        if selector.startswith('/*',i):
            j=selector.find('*/',i+2); i=len(selector) if j<0 else j+2; continue
        if selector[i] in ('"',"'"):
            i=skip_string(selector,i,len(selector)); continue
        ch=selector[i]
        if ch=='(': par+=1
        elif ch==')' and par: par-=1
        elif ch=='[': br+=1
        elif ch==']' and br: br-=1
        elif ch==',' and par==0 and br==0:
            parts.append(selector[start:i].strip()); start=i+1
        i+=1
    parts.append(selector[start:].strip())
    return [p for p in parts if p]

def source_inventory():
    html='\n'.join(p.read_text('utf8',errors='ignore') for p in (ROOT/'src/html').rglob('*.html'))
    js='\n'.join(p.read_text('utf8',errors='ignore') for p in (ROOT/'src/js').rglob('*.js'))
    source=html+'\n'+js
    # Tokens occurring literally anywhere in source. Boundary checks avoid substring false positives.
    literal_classes=set(re.findall(r'(?<![\w-])([A-Za-z_][\w-]{1,})(?![\w-])',source))
    literal_ids=set(literal_classes)
    dyn_prefixes=set()
    # template classes/ids: foo-${value}
    dyn_prefixes.update(re.findall(r'([A-Za-z_][\w-]*-)\$\{',js))
    # string concatenation: "foo-" + value
    dyn_prefixes.update(re.findall(r'''["']([A-Za-z_][\w-]*-)["']\s*\+''',js))
    return literal_classes,literal_ids,dyn_prefixes

def used_token(token,literals,dyn_prefixes):
    if token in literals:return True
    return any(token.startswith(prefix) for prefix in dyn_prefixes)

def selector_dead(branch,classes,ids,dyn):
    # Remove :not(...) content before checking required tokens: a missing token inside :not is not required.
    cleaned=re.sub(r':not\([^)]*\)','',branch)
    req_classes=re.findall(r'(?<![\\\w-])\.([A-Za-z_][\w-]*)',cleaned)
    req_ids=re.findall(r'(?<![\\\w-])#([A-Za-z_][\w-]*)',cleaned)
    missing_c=[x for x in req_classes if not used_token(x,classes,dyn)]
    missing_i=[x for x in req_ids if not used_token(x,ids,dyn)]
    return bool(missing_c or missing_i),missing_c,missing_i

def process(path,apply,classes,ids,dyn):
    s=path.read_text('utf8'); rules=[]; collect_rules(s,0,len(s),path,rules)
    edits=[]; rows=[]
    for rule in rules:
        branches=split_selector_list(rule.selector)
        kept=[]; dropped=[]
        for b in branches:
            dead,mc,mi=selector_dead(b,classes,ids,dyn)
            if dead:dropped.append((b,mc,mi))
            else:kept.append(b)
        if not dropped:continue
        for b,mc,mi in dropped:
            rows.append((path.relative_to(ROOT).as_posix(),rule.selector,b,','.join(mc),','.join(mi),'drop-branch' if kept else 'drop-rule'))
        if kept:
            edits.append((rule.header_start,rule.header_end,',\n'.join(kept)))
        else:
            # Remove selector + block, preserving leading comments/whitespace outside selector span.
            edits.append((rule.header_start,rule.block_end,''))
    if apply and edits:
        for a,b,repl in sorted(edits,reverse=True):s=s[:a]+repl+s[b:]
        path.write_text(s,'utf8')
    return rows

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--apply',action='store_true');ap.add_argument('--report',type=Path,default=ROOT/'audit/dead-css-pruned.tsv');args=ap.parse_args()
    classes,ids,dyn=source_inventory();rows=[]
    for p in sorted((ROOT/'src/css').rglob('*.css')):rows.extend(process(p,args.apply,classes,ids,dyn))
    args.report.parent.mkdir(parents=True,exist_ok=True)
    with args.report.open('w',encoding='utf8') as f:
        f.write('file\trule_selector\tdropped_branch\tmissing_classes\tmissing_ids\taction\n')
        for row in rows:f.write('\t'.join(x.replace('\t',' ').replace('\n',' ') for x in row)+'\n')
    print(f'dead_selector_branches={len(rows)} apply={args.apply} dynamic_prefixes={len(dyn)} report={args.report}')
if __name__=='__main__':main()
