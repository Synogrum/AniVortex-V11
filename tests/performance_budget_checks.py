#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
site=root/'site'

def kib(n): return n/1024

def mib(n): return n/1024/1024

limits={
    'index_html_kib': 800,
    'total_css_kib': 700,
    'total_js_kib': 300,
    'largest_css_kib': 330,
    'largest_js_kib': 120,
    'largest_asset_kib': 500,
    'total_site_mib': 26,
}

index=(site/'index.html').stat().st_size
css=list((site/'assets/css').glob('*.css'))
js=list((site/'assets/js').glob('*.js'))
assets=[p for p in site.rglob('*') if p.is_file() and p.suffix.lower() not in {'.css','.js','.html'}]
all_files=[p for p in site.rglob('*') if p.is_file()]
metrics={
    'index_html_kib': kib(index),
    'total_css_kib': kib(sum(p.stat().st_size for p in css)),
    'total_js_kib': kib(sum(p.stat().st_size for p in js)),
    'largest_css_kib': kib(max(p.stat().st_size for p in css)),
    'largest_js_kib': kib(max(p.stat().st_size for p in js)),
    'largest_asset_kib': kib(max(p.stat().st_size for p in assets)),
    'total_site_mib': mib(sum(p.stat().st_size for p in all_files)),
}
fail=[]
for key,value in metrics.items():
    if value>limits[key]: fail.append(f'{key}: {value:.1f} > {limits[key]}')
if fail:
    print('PERFORMANCE BUDGET FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PERFORMANCE BUDGET PASS')
for key,value in metrics.items(): print(f'- {key}: {value:.1f} / {limits[key]}')
