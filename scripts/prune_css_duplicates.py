#!/usr/bin/env python3
"""Remove provably redundant *exact* CSS declarations from modular sources.

A declaration is removed only when a later rule in the same generated stylesheet
has the exact same selector, grouping-at-rule context, property, value and
importance flag. Different values are preserved (including browser fallbacks).
"""
from __future__ import annotations
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
import csv, json
import tinycss2

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'/'css'
MANIFEST=json.loads((ROOT/'build-manifest.json').read_text('utf-8'))
REPORT=ROOT/'audit'/'css-duplicate-prune.tsv'
GROUPING={'media','supports','layer','container','scope','document'}

@dataclass
class Removed:
    file:str
    selector:str
    context:str
    property:str
    value:str


def prop_name(d):
    return d.name if d.name.startswith('--') else d.lower_name


def rule_list_text(rules):
    return tinycss2.serialize(rules)


def process_rules(rules, ctx, seen, relpath, removed):
    out_rev=[]
    for rule in reversed(rules):
        if rule.type in {'whitespace','comment'}:
            out_rev.append(rule)
            continue
        if rule.type=='qualified-rule':
            selector=tinycss2.serialize(rule.prelude).strip()
            key=(ctx,selector)
            items=tinycss2.parse_declaration_list(rule.content,skip_whitespace=False,skip_comments=False)
            drop_ids=set()
            for item in reversed(items):
                if item.type!='declaration':
                    continue
                sig=(prop_name(item),tinycss2.serialize(item.value).strip(),bool(item.important))
                if sig in seen[key]:
                    drop_ids.add(id(item))
                    removed.append(Removed(relpath,selector,' > '.join(f'@{a} {b}' for a,b in ctx),sig[0],sig[1]))
                else:
                    seen[key].add(sig)
            kept=[item for item in items if id(item) not in drop_ids]
            if any(item.type=='declaration' for item in kept):
                rule.content=tinycss2.parse_component_value_list(tinycss2.serialize(kept))
                out_rev.append(rule)
            # If no declarations remain, the rule is redundant and is omitted.
            continue
        if rule.type=='at-rule' and rule.content is not None and rule.lower_at_keyword in GROUPING:
            pre=tinycss2.serialize(rule.prelude).strip()
            nested=tinycss2.parse_rule_list(rule.content,skip_whitespace=False,skip_comments=False)
            processed=process_rules(nested,ctx+((rule.lower_at_keyword,pre),),seen,relpath,removed)
            rule.content=tinycss2.parse_component_value_list(rule_list_text(processed))
            out_rev.append(rule)
            continue
        out_rev.append(rule)
    out_rev.reverse()
    return out_rev


def process_group(paths, removed):
    seen=defaultdict(set)
    parsed=[]
    for path in paths:
        text=path.read_text('utf-8')
        parsed.append((path,tinycss2.parse_stylesheet(text,skip_whitespace=False,skip_comments=False)))
    # Later source files are later in the generated stylesheet.
    for path,rules in reversed(parsed):
        rel=str(path.relative_to(ROOT))
        processed=process_rules(rules,(),seen,rel,removed)
        path.write_text(tinycss2.serialize(processed),'utf-8')


def main():
    removed=[]
    used=set()
    for _bundle, parts in MANIFEST['css_bundles'].items():
        paths=[SRC/part for part in parts]
        process_group(paths,removed)
        used.update(paths)
    for name in MANIFEST['css_files']:
        path=SRC/'components'/name
        process_group([path],removed)
        used.add(path)

    REPORT.parent.mkdir(parents=True,exist_ok=True)
    with REPORT.open('w',encoding='utf-8',newline='') as f:
        w=csv.writer(f,delimiter='\t')
        w.writerow(['file','selector','context','property','value'])
        for row in removed:
            w.writerow([row.file,row.selector,row.context,row.property,row.value])
    print(f'Removed {len(removed)} exact duplicate CSS declarations')
    print(f'Report: {REPORT.relative_to(ROOT)}')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
