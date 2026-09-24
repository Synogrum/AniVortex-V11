#!/usr/bin/env python3
from pathlib import Path
from collections import defaultdict
import tinycss2

root = Path(__file__).resolve().parents[1]
fail = []
GROUPING = {'media','supports','layer','container','scope','document'}

def prop_name(d):
    return d.name if d.name.startswith('--') else d.lower_name

def walk(rules, ctx=()):
    out=[]
    for rule in rules:
        if rule.type == 'qualified-rule':
            selector=tinycss2.serialize(rule.prelude).strip()
            declarations=[d for d in tinycss2.parse_declaration_list(rule.content,skip_whitespace=True,skip_comments=True) if d.type=='declaration']
            out.append((ctx,selector,declarations))
        elif rule.type=='at-rule' and rule.content is not None and rule.lower_at_keyword in GROUPING:
            prelude=tinycss2.serialize(rule.prelude).strip()
            nested=tinycss2.parse_rule_list(rule.content,skip_whitespace=True,skip_comments=True)
            out.extend(walk(nested,ctx+((rule.lower_at_keyword,prelude),)))
    return out

for css in sorted((root/'site/assets/css').glob('*.css')):
    rules=tinycss2.parse_stylesheet(css.read_text('utf-8',errors='replace'),skip_whitespace=True,skip_comments=True)
    seq=walk(rules)
    seen=defaultdict(set)
    duplicates=[]
    for ctx,selector,declarations in reversed(seq):
        key=(ctx,selector)
        local=set()
        for d in reversed(declarations):
            sig=(prop_name(d),tinycss2.serialize(d.value).strip(),bool(d.important))
            if sig in local or sig in seen[key]:
                duplicates.append((selector,sig[0],sig[1]))
            else:
                local.add(sig); seen[key].add(sig)
    if duplicates:
        fail.append(f'{css.name}: {len(duplicates)} exact duplicate declarations')

if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - no redundant exact CSS declarations')
