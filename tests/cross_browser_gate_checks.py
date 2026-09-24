from pathlib import Path
root=Path(__file__).resolve().parents[1]
script=root/'scripts/cross_browser_smoke.py'
workflow=(root/'.github/workflows/verify.yml').read_text('utf-8')
assert script.exists(), 'cross_browser_smoke.py missing'
text=script.read_text('utf-8')
for engine in ('chromium','firefox','webkit'):
    assert engine in text, f'{engine} engine missing from cross browser smoke'
assert 'playwright install --with-deps chromium firefox webkit' in workflow, 'CI must install all three browser engines'
assert 'cross_browser_smoke.py' in workflow, 'CI must run the cross-browser smoke gate'
print('CROSS BROWSER GATE CHECKS PASS')
