#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys
try:
    import tinycss2
except ImportError:
    print('FAIL - install dev requirements: pip install -r requirements-dev.txt')
    raise SystemExit(1)

root=Path(__file__).resolve().parents[1]
fail=[]

build=subprocess.run([sys.executable,str(root/'scripts/build.py'),'--check'],capture_output=True,text=True)
if build.returncode:
    fail.append('Generated site differs from modular src/ (run scripts/build.py)')

for js in sorted((root/'src/js').rglob('*.js')):
    proc=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
    if proc.returncode:
        fail.append(f'Invalid JS source {js.relative_to(root)}: {proc.stderr.strip()}')

for css in sorted((root/'src/css').rglob('*.css')):
    text=css.read_text('utf-8',errors='replace')
    if '!important' in text:
        fail.append(f'Forbidden !important in {css.relative_to(root)}')
    errors=[x for x in tinycss2.parse_stylesheet(text,skip_comments=False,skip_whitespace=False) if x.type=='error']
    if errors:
        fail.append(f'Invalid CSS source {css.relative_to(root)}: {errors[0].message}')

for css in sorted((root/'site/assets/css').glob('*.css')):
    text=css.read_text('utf-8',errors='replace')
    if '!important' in text:
        fail.append(f'Forbidden !important in generated {css.relative_to(root)}')

for js in list((root/'src/js').rglob('*.js')) + list((root/'site/assets/js').glob('*.js')):
    text=js.read_text('utf-8',errors='replace')
    if 'setProperty(\"position\", \"fixed\", \"important\")' in text or "setProperty('position', 'fixed', 'important')" in text:
        fail.append(f'Forced important priority in JS {js.relative_to(root)}')

if fail:
    print('FAIL')
    for item in fail: print('-',item)
    raise SystemExit(1)
print('PASS - modular source/build checks passed')
