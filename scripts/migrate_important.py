#!/usr/bin/env python3
"""Migrate CSS declarations away from !important while preserving cascade priority.

For each qualified rule that contains important declarations:
- non-important declarations stay on the original selector;
- important declarations are emitted in a second rule using the same selector plus
  an always-true specificity guard;
- the !important flag itself is removed.

The guard uses an impossible multi-ID compound inside :not(), so it never filters
real elements while adding a fixed specificity boost. Because the same boost is
added to every migrated selector, relative specificity between formerly-important
rules is preserved.
"""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import csv
import re
import tinycss2

ROOT = Path(__file__).resolve().parents[1]
CSS_ROOT = ROOT / "src" / "css"
REPORT = ROOT / "audit" / "important-migration.tsv"
GUARD = ":not(#__av_prio_a#__av_prio_b)"
GROUPING_AT_RULES = {"media", "supports", "layer", "container", "scope", "document"}

@dataclass
class Row:
    file: str
    selector: str
    properties: str


def split_selector_tokens(tokens):
    groups, current = [], []
    for token in tokens:
        if getattr(token, "type", None) == "literal" and getattr(token, "value", None) == ",":
            groups.append(current); current = []
        else:
            current.append(token)
    groups.append(current)
    return groups


def add_guard(selector: str) -> str:
    s = selector.strip()
    # Pseudo-elements must remain the final part of a compound selector.
    # Match double-colon syntax first so legacy single-colon names never match
    # the second colon from ::before/::after.
    double = re.search(r"::(?:before|after|first-line|first-letter|selection|placeholder)\b", s, re.I)
    if double:
        pos = double.start()
        return s[:pos].rstrip() + GUARD + s[pos:]

    legacy = re.search(r"(?<!:):(?:before|after|first-line|first-letter)\b", s, re.I)
    if legacy:
        pos = legacy.start()
        return s[:pos].rstrip() + GUARD + s[pos:]

    return s + GUARD


def serialize_decls(items) -> str:
    out = []
    for item in items:
        if item.type == "declaration":
            prefix = f"{item.name}:"
            value = tinycss2.serialize(item.value).strip()
            out.append(f"  {prefix} {value};")
        elif item.type == "comment":
            out.append(f"  /*{item.value}*/")
    return "\n".join(out)


def transform_rule(rule, relpath: str, rows: list[Row]) -> str:
    selector = tinycss2.serialize(rule.prelude).strip()
    decls = tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=False)
    important = [d for d in decls if d.type == "declaration" and d.important]
    if not important:
        return tinycss2.serialize([rule])

    normals = [d for d in decls if not (d.type == "declaration" and d.important)]
    props = [d.name for d in important]
    rows.append(Row(relpath, selector, ",".join(props)))

    selector_groups = split_selector_tokens(rule.prelude)
    boosted = ", ".join(add_guard(tinycss2.serialize(group)) for group in selector_groups)

    # Strip only the importance flag, leaving values untouched.
    for d in important:
        d.important = False

    blocks = []
    normal_text = serialize_decls(normals)
    if normal_text.strip():
        blocks.append(f"{selector} {{\n{normal_text}\n}}")
    important_text = serialize_decls(important)
    blocks.append(f"{boosted} {{\n{important_text}\n}}")
    return "\n\n".join(blocks)


def transform_rule_list(text: str, relpath: str, rows: list[Row]) -> str:
    rules = tinycss2.parse_rule_list(text, skip_whitespace=False, skip_comments=False)
    out = []
    for rule in rules:
        if rule.type in {"whitespace", "comment"}:
            out.append(tinycss2.serialize([rule])); continue
        if rule.type == "qualified-rule":
            out.append(transform_rule(rule, relpath, rows)); continue
        if rule.type == "at-rule":
            prelude = tinycss2.serialize(rule.prelude)
            if rule.content is None:
                out.append(f"@{rule.at_keyword}{prelude};"); continue
            if rule.lower_at_keyword in GROUPING_AT_RULES:
                inner = transform_rule_list(tinycss2.serialize(rule.content), relpath, rows)
                out.append(f"@{rule.at_keyword}{prelude}{{{inner}}}")
            else:
                # Keyframes/font-face/page/property are left structurally intact.
                out.append(tinycss2.serialize([rule]))
            continue
        out.append(tinycss2.serialize([rule]))
    return "".join(out)


def main() -> int:
    rows: list[Row] = []
    for path in sorted(CSS_ROOT.rglob("*.css")):
        original = path.read_text("utf-8")
        if "!important" not in original:
            continue
        rel = str(path.relative_to(ROOT))
        migrated = transform_rule_list(original, rel, rows)
        path.write_text(migrated, "utf-8")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["file", "selector", "properties_migrated"])
        for row in rows:
            writer.writerow([row.file, row.selector, row.properties])

    remaining = sum(p.read_text("utf-8").count("!important") for p in CSS_ROOT.rglob("*.css"))
    count = sum(len(r.properties.split(",")) for r in rows if r.properties)
    print(f"Migrated {count} important declarations across {len(rows)} rules")
    print(f"Remaining !important in src/css: {remaining}")
    return 0 if remaining == 0 else 1

if __name__ == "__main__":
    raise SystemExit(main())
