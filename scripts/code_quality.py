#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
from collections import Counter, defaultdict
import json, re, subprocess, sys, tempfile
import tinycss2
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
CFG=json.loads((ROOT/'quality-gates.json').read_text('utf8'))

def fail(msg):
    print('FAIL -',msg); return False

def check_js_syntax():
    ok=True
    for p in sorted((ROOT/'src/js').rglob('*.js')):
        r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
        if r.returncode:
            ok=fail(f'JS syntax: {p.relative_to(ROOT)}: {r.stderr.strip()}') and ok
    return ok

def check_debug_patterns():
    ok=True
    for p in sorted((ROOT/'src/js').rglob('*.js')):
        s=p.read_text('utf8',errors='ignore')
        for pattern in CFG['forbidden_js_patterns']:
            if pattern in s:
                ok=fail(f'forbidden JS pattern {pattern!r} in {p.relative_to(ROOT)}') and ok
    return ok

def check_html():
    html=''.join(p.read_text('utf8') for p in sorted((ROOT/'src/html').rglob('*.html')))
    soup=BeautifulSoup(html,'html.parser'); ok=True
    ids=Counter(tag.get('id') for tag in soup.find_all(id=True))
    dup=[x for x,n in ids.items() if n>1]
    if dup: ok=fail(f'duplicate HTML ids: {dup}') and ok
    inline=[]
    for tag in soup.find_all(True):
        for attr in tag.attrs:
            if attr.lower()=='style' or (attr.lower().startswith('on') and len(attr)>2):
                inline.append((tag.name,tag.get('id',''),attr))
    if inline: ok=fail(f'inline style/event attributes remain: {inline[:10]}') and ok
    return ok

def walk_css_rules(rules,file,ctx,conf):
    for r in rules:
        if r.type=='error':
            conf['errors'].append((file,str(r)))
        elif r.type=='qualified-rule':
            sel=tinycss2.serialize(r.prelude).strip()
            decls=tinycss2.parse_declaration_list(r.content,skip_whitespace=True,skip_comments=True)
            by=defaultdict(list)
            for d in decls:
                if d.type=='error': conf['errors'].append((file,f'{sel}: {d}')); continue
                if d.type=='declaration': by[d.name.lower()].append(tinycss2.serialize(d.value).strip())
            for prop,vals in by.items():
                conf['occ'][(file,tuple(ctx),sel,prop)].append(vals)
        elif r.type=='at-rule' and r.content is not None:
            keyword=r.at_keyword.lower()
            # Only these at-rules contain nested style rules. @property/@font-face contain declarations.
            if keyword in {'media','supports','container','layer','scope','document'}:
                nested=tinycss2.parse_rule_list(r.content,skip_whitespace=False,skip_comments=False)
                walk_css_rules(nested,file,ctx+[f'@{r.at_keyword} {tinycss2.serialize(r.prelude).strip()}'],conf)

def check_css_and_report():
    data={'errors':[],'occ':defaultdict(list)}; ok=True
    for p in sorted((ROOT/'src/css').rglob('*.css')):
        s=p.read_text('utf8',errors='ignore')
        if '!important' in s: ok=fail(f'!important reintroduced in {p.relative_to(ROOT)}') and ok
        if re.search(r'@import\b',s,re.I): ok=fail(f'CSS @import found in {p.relative_to(ROOT)}') and ok
        rules=tinycss2.parse_stylesheet(s,skip_whitespace=False,skip_comments=False)
        walk_css_rules(rules,p.relative_to(ROOT).as_posix(),[],data)
    if data['errors']:
        for e in data['errors'][:20]: print('CSS parse error:',e)
        ok=False
    conflicts=[]
    for (file,ctx,sel,prop),rule_values in data['occ'].items():
        # Conflict chain means same exact selector/context/property appears in separate rules with differing values.
        if len(rule_values)>1:
            flattened=[v for vals in rule_values for v in vals]
            if len(set(flattened))>1:
                conflicts.append((file,' > '.join(ctx),sel,prop,' || '.join(flattened)))
    report=ROOT/'audit/css-conflicts.tsv'; report.parent.mkdir(parents=True,exist_ok=True)
    with report.open('w',encoding='utf8') as f:
        f.write('file\tcontext\tselector\tproperty\tvalues\n')
        for row in conflicts:f.write('\t'.join(x.replace('\t',' ').replace('\n',' ') for x in row)+'\n')
    if len(conflicts)>CFG['max_css_conflict_chains']:
        ok=fail(f'CSS conflict chains increased: {len(conflicts)} > {CFG["max_css_conflict_chains"]}') and ok
    print(f'CSS conflict chains (budgeted/intentional): {len(conflicts)} / {CFG["max_css_conflict_chains"]}')
    return ok

def check_complexity():
    ok=True
    for p in sorted((ROOT/'src/css').rglob('*.css')):
        if p.stat().st_size>CFG['max_css_file_bytes']:
            ok=fail(f'CSS file too large: {p.relative_to(ROOT)} {p.stat().st_size} bytes') and ok
    for p in sorted((ROOT/'src/js').rglob('*.js')):
        if p.stat().st_size>CFG['max_js_file_bytes']:
            ok=fail(f'JS file too large: {p.relative_to(ROOT)} {p.stat().st_size} bytes') and ok
    return ok

def check_pruners_clean():
    ok=True
    checks=[('prune_css_overrides.py','override'),('prune_dead_css.py','dead CSS')]
    for script,label in checks:
        with tempfile.NamedTemporaryFile(suffix='.tsv',delete=False) as tf: path=Path(tf.name)
        r=subprocess.run([sys.executable,str(ROOT/'scripts'/script),'--report',str(path)],capture_output=True,text=True)
        if r.returncode:
            ok=fail(f'{label} audit failed: {r.stdout} {r.stderr}') and ok; continue
        lines=path.read_text('utf8').splitlines(); path.unlink(missing_ok=True)
        if len(lines)>1:
            ok=fail(f'{label} candidates remain: {len(lines)-1}') and ok
    return ok

def main():
    checks=[check_js_syntax(),check_debug_patterns(),check_html(),check_css_and_report(),check_complexity(),check_pruners_clean()]
    if not all(checks): return 1
    print('PASS - code quality gates passed')
    return 0
if __name__=='__main__': raise SystemExit(main())
