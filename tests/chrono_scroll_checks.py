from pathlib import Path

root = Path(__file__).resolve().parents[1]
chrono = (root / 'src/js/components/chrono.js').read_text(encoding='utf-8')

errors = []
if 'scrollIntoView' in chrono:
    errors.append('chrono.js still uses scrollIntoView, which can move the whole page on load')
if 'yearsViewport.scrollTo' not in chrono:
    errors.append('chrono.js should scroll only the years viewport horizontally')

if errors:
    print('\n'.join(f'FAIL: {e}' for e in errors))
    raise SystemExit(1)
print('PASS - chronology keeps page position stable')
