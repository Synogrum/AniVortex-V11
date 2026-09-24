# AniVortex V5 — production refinement

## Rezultat

V5 continuă V4 fără redesign intenționat. Runda se concentrează pe stabilitatea la încărcare, responsive real, imagini adaptative, accesibilitate la tastatură și verificare în Chromium.

- `site/`: 22,206,173 bytes
- validare deploy: **410/410 fișiere, 0 erori**
- `python scripts/verify.py`: **ALL CHECKS PASS**
- browser smoke: **7/7 viewports PASS**
- cache assets: `20260920.5`

## 1. Bug reparat — pagina nu mai sare la Cronologie

`chrono.js` folosea `scrollIntoView()` inclusiv la inițializarea anului curent. În browser, acest lucru muta pagina la aproximativ 7.600 px în jos imediat după încărcare.

V5:
- elimină `scrollIntoView()` din cronologie;
- deplasează numai containerul orizontal al anilor cu `yearsViewport.scrollTo()`;
- focusul folosește `preventScroll`;
- test nou: `tests/chrono_scroll_checks.py`.

Browser smoke confirmă `scrollY = 0` după inițializare la toate rezoluțiile testate.

## 2. Banner responsive images

Cele 10 imagini hero de 1200×600 au acum variante 600w și 900w în `site/public/imgs/banner/responsive/`. Fiecare `<img class="hero-image">` folosește `srcset` + `sizes`; primul preload Naruto folosește și `imagesrcset`/`imagesizes`.

- total originale 1200w: 1959.3 KiB
- total variante 600w: 472.3 KiB
- total variante 900w: 833.2 KiB
- economie medie pentru varianta 600w: **76.2%**

Raport: `audit/responsive-banner-assets.tsv`.

## 3. UPC — stare ARIA și focus

- cardul activ primește `aria-expanded="true"`;
- cardul anterior este resetat la `false` când popup-ul se mută;
- Escape închide popup-ul și readuce focusul pe card cu `preventScroll`;
- test nou: `tests/upc_popup_a11y_checks.py`.

## 4. Favorite — meniu accesibil din tastatură

Meniul de status are acum:
- deschidere controlată cu Enter/Space;
- ArrowUp / ArrowDown;
- Home / End;
- Escape cu revenirea focusului;
- selectarea statusului readuce focusul pe buton;
- focusul în meniu așteaptă tranziția de vizibilitate pentru a evita focus pe element încă `visibility:hidden`.

Test nou: `tests/favorites_menu_a11y_checks.py`.

## 5. Browser smoke real în Chromium

A fost adăugat `scripts/browser_smoke.py`. Din cauza politicii mediului care blochează navigarea `localhost`/`file://`, testul încarcă HTML-ul cu CSS/JS locale inline; imaginile locale sunt înlocuite numai în harness cu un pixel transparent, păstrând dimensiunile declarate. Codul DOM/CSS/JS testat este cel de deploy.

Viewports:
- 360×800
- 390×844
- 430×932
- 768×1024
- 1366×768
- 1920×1080
- 2560×1440

Verificări automate:
- pagina nu sare după load;
- `scrollWidth` nu depășește viewport-ul;
- zero `pageerror` / console errors;
- Favorite poate fi operat cu tastatura;
- UPC expune starea dialogului și restabilește focusul;
- popup-ul UPC rămâne în viewport pe mobil.

Rezultate: `audit/browser-smoke.json`. Capturi: `audit/v5-browser-final/`.

## 6. CI mai strict

GitHub Actions instalează Chromium prin Playwright și rulează acum și browser smoke-ul la fiecare push/PR. `requirements-dev.txt` include Playwright, iar `tests/ci_checks.py` verifică existența pașilor.

## 7. Test suite

`verify.py` include acum și:
- `chrono_scroll_checks.py`;
- `responsive_images_checks.py`;
- `upc_popup_a11y_checks.py`;
- `favorites_menu_a11y_checks.py`.

## Limită cunoscută

Browser smoke V5 este Chromium. Nu reprezintă încă o certificare Safari/iOS sau Firefox pixel-perfect. Capturile din harness folosesc placeholder transparent pentru imaginile locale din cauza restricției de navigare a mediului; geometria, responsive-ul, CSS-ul și JavaScript-ul sunt cele reale.
