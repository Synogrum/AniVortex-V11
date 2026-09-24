# Changelog AniVortex

Versiunea completă reorganizează proiectul în `site/` + `src/`, întărește CSP și linkurile, elimină JavaScript-ul inline, repară referințe lipsă, îmbunătățește accesibilitatea, modularizează fișierele mari, optimizează 145 imagini și adaugă build/test/validation automat.

Actualizare CSS finală:
- toate aparițiile `!important` au fost eliminate din codul CSS;
- prioritatea vechilor reguli este păstrată prin specificitate controlată;
- prioritatea `important` din popup-ul Trending a fost eliminată din JS;
- un test automat împiedică reintroducerea `!important`;
- toate verificările finale trec.

Pentru lista completă, vezi `MODIFICARI_COMPLETE.md`.

## V3 — rafinare avansată

- Trending: 3 observers → 1 și fără listener-e duplicate la rerandare;
- popup Favorite/Episode throttled pe frame;
- autoplay accesibil: pauză la hover/focus în Trending, UPC, Banner, Top sugestii și Favorite;
- UPC: ArrowLeft/ArrowRight, ARIA pentru popup și touch vertical mai bun;
- 20 stiluri inline HTML eliminate;
- specificitate migrată simplificată de la 8 la 2 ID-uri fictive;
- cod mort `#continutZi` / `#statusDot` eliminat;
- `100dvh`, lazy-decoding suplimentar și cache `20260920.3`;
- `verify.py` rulează întreaga suită și rezultatul este `ALL CHECKS PASS`.

## V4 — Manager-e comune și runtime
- Popup Manager comun pentru Trending, UPC, Favorite și popup episoade.
- Carousel Manager comun pentru Banner, Trending, UPC, Top Sugestii și Favorite.
- Swipe mobil pe Banner + `touch-action: pan-y`.
- UPC: keyboard delegation și eliminare reset duplicat.
- Asset version 20260920.4.
- GitHub Actions verifică automat build-ul și toate testele.
- 390/390 fișiere deploy valide, 0 erori, `ALL CHECKS PASS`.
- Detalii: `audit/V4_RAFINARE.md`.


## V5 — production refinement
- reparat saltul automat al paginii către Cronologie la încărcare;
- 10 imagini Banner cu `srcset` 600/900/1200 și preload responsive;
- UPC: `aria-expanded` corect + Escape cu focus restore;
- Favorite: navigare completă din tastatură și focus restore;
- browser smoke Chromium pe 7 viewports;
- GitHub CI rulează acum și browser smoke prin Playwright;
- cache `20260920.5`;
- 410/410 fișiere valide, `ALL CHECKS PASS`;
- detalii: `audit/V5_RAFINARE.md`.

## V6 — Clean Architecture / zero CSS conflicts
- 695 declarații CSS superseded eliminate;
- 329 ramuri/selectori CSS morți eliminați;
- CSS source redus cu 66,797 bytes și 1,572 linii față de V5;
- 0 conflict chains CSS pentru același selector/context/proprietate;
- `quality-gates.json` + `scripts/code_quality.py` adăugate;
- quality gate: sintaxă JS, parsare CSS, duplicate IDs, debug code, dead CSS, override-uri, complexitate;
- centrare deterministă pentru bara zilelor din Serii programate;
- CI simplificat la un singur production gate (`python scripts/verify.py`);
- browser smoke 7/7 viewports PASS;
- 410/410 fișiere deploy valide;
- guard-ul de specificitate a fost testat pentru eliminare și păstrat deoarece eliminarea produce regresii vizuale măsurabile;
- detalii: `audit/V6_CLEAN_ARCHITECTURE.md`.


## V7 — FINAL PRODUCTION
- 10 controale Filter convertite din `div role=button` în `<button type="button">` native;
- skip-link accesibil către `main#mainContent`;
- performance budgets automate pentru dimensiunea HTML/CSS/JS/assets/deploy;
- cross-browser smoke pentru Chromium/Firefox/WebKit adăugat în CI;
- Lighthouse CI 0.15.x configurat în GitHub Actions;
- quality reports salvate ca artifact CI;
- cache `20260920.7`;
- Chromium smoke local pe 7 viewport-uri rămâne gate obligatoriu.


## V8 performance hotfix
- Fixed banner image vertical layout shift during fade-in animation.
- Hot News data moved out of initial HTML; popups are created lazily on hover/focus.
- Added offscreen animation pausing and reduced decorative motion on mobile.
- Asset cache version 20260920.8.

## V8 — Banner & Performance
- Banner layout shift eliminat (0 px în test Chromium).
- Hot News data-driven + popup lazy.
- DOM inițial redus semnificativ.
- Offscreen CSS animations paused automatically.
- Mobile ambient motion reduced.
- Dead CSS rămas după Hot News migration eliminat.
V10 comprehensive stability/performance pass started.

## V11
- Bannerul din dreapta a fost ridicat vizibil mai sus, ca imaginea să înceapă din zona „în prim plan AniVortex”, nu mai jos.
- Offset-ul desktop al imaginii a fost redus de la 54px la 18px, iar spațiul superior din coloana dreaptă a fost redus de la 74px la 42px.
- Pentru tabletă și mobil au fost reduse similar offset-urile, astfel încât poziția să rămână coerentă pe toate ecranele.
- Asset version ridicată la `20260920.10` pentru a evita cache-ul vechi după deploy.
