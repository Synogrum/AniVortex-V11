from pathlib import Path

root=Path(__file__).resolve().parents[1]
js=(root/'src/js/main/01-favorites.js').read_text(encoding='utf-8')
errors=[]
for token, msg in [
    ('function getMenuItems()', 'favorite menu should expose a reusable menu-item list'),
    ("event.key === \"ArrowDown\"", 'favorite menu should support ArrowDown'),
    ("event.key === \"ArrowUp\"", 'favorite menu should support ArrowUp'),
    ("event.key === \"Home\"", 'favorite menu should support Home'),
    ("event.key === \"End\"", 'favorite menu should support End'),
    ('closePopup({ restoreFocus: true })', 'favorite menu Escape/selection should restore focus'),
    ('focusMenuItem(0)', 'keyboard opening should focus the first menu item'),
]:
    if token not in js: errors.append(msg)

if errors:
    print('\n'.join(f'FAIL: {e}' for e in errors))
    raise SystemExit(1)
print('PASS - favorite status menu has keyboard navigation and focus restoration')
