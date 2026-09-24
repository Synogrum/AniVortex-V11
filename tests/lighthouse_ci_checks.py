from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
config=root/'lighthouserc.json'
workflow=(root/'.github/workflows/verify.yml').read_text('utf-8')
assert config.exists(), 'lighthouserc.json missing'
data=json.loads(config.read_text('utf-8'))
ci=data.get('ci',{})
assert ci.get('collect',{}).get('staticDistDir') == './site', 'Lighthouse CI must audit the production site directory'
assert 'categories:performance' in ci.get('assert',{}).get('assertions',{}), 'Performance category assertion missing'
assert 'categories:accessibility' in ci.get('assert',{}).get('assertions',{}), 'Accessibility category assertion missing'
assert '@lhci/cli@0.15' in workflow, 'CI must install a pinned Lighthouse CI 0.15.x release'
assert 'lhci autorun' in workflow, 'CI must run Lighthouse CI'
print('LIGHTHOUSE CI CHECKS PASS')
