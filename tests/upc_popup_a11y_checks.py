from pathlib import Path

root = Path(__file__).resolve().parents[1]
js = (root / 'src/js/components/UPC.js').read_text(encoding='utf-8')
errors=[]

if "card.setAttribute('aria-expanded', 'true')" not in js:
    errors.append('UPC openPopup must expose aria-expanded=true on the active card')
if "triggerCard.setAttribute('aria-expanded', 'false')" not in js:
    errors.append('UPC closePopup must reset aria-expanded on the card that opened the popup')
if 'closePopup({ restoreFocus: true })' not in js:
    errors.append('UPC Escape should close the popup and restore focus to its trigger card')
if 'triggerCard?.focus({ preventScroll: true })' not in js:
    errors.append('UPC closePopup should restore keyboard focus without scrolling the page')

if errors:
    print('\n'.join(f'FAIL: {e}' for e in errors))
    raise SystemExit(1)
print('PASS - UPC popup exposes and restores accessible expanded/focus state')
