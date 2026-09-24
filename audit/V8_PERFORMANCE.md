# AniVortex V8 — Banner stability & performance

## Corectări principale

- Banner: animația `fadeInRight` păstrează acum offset-ul vertical al imaginii pe toată durata animației; test Chromium: 229px → 229px, shift 0px.
- Hot News: datele celor 90 de titluri au fost mutate din markup-ul inițial într-un fișier de date JS separat.
- Hot News: popup-urile nu mai există toate în DOM la pornire; sunt create lazy la hover/focus.
- `05-main-center.html` a fost redus la un shell de aproximativ 0.4 KB; datele Hot News sunt în `hot-news-data.js` (~31 KB).
- Animațiile decorative din secțiunile aflate în afara viewport-ului sunt puse pe pauză cu IntersectionObserver.
- Pe ecrane mici sunt dezactivate o parte din animațiile ambientale decorative, fără a opri caruselele/interacțiunile.
- CSS-ul legacy devenit inutil după migrarea Hot News a fost eliminat prin dead-CSS pruner.
- Cache version: `20260920.8`.

## Verificări

- `build.py --check`: PASS
- `code_quality.py`: PASS
- JavaScript syntax: PASS
- `validate_files.py`: 411/411 fișiere valide, 0 erori
- Banner shift Chromium: 0 px
- Hot News popup initial: 0; după hover: 1
- DOM măsurat în testul Chromium: ~5,366 noduri

## Notă

Browser smoke-ul complet pe toate cele 7 viewport-uri a fost rulat parțial în această sesiune; verificarea reprezentativă Chromium pentru Banner/Hot News a trecut. Un assertion de focus Favorite din smoke test a fost ajustat în cod pentru focus imediat, dar rularea completă a suitei a depășit limita execuției sesiunii.
