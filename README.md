# AniVortex — structură finală

## Ce publici

Publică **conținutul folderului `site/`**. Acesta este deploy-ul static gata de GitHub Pages.

## Ce editezi

Pentru modificări mari, lucrează în `src/`, nu direct în bundle-urile mari din `site/assets`:

- `src/html/index/` — secțiunile paginii;
- `src/css/` — CSS pe componente/module;
- `src/js/` — JavaScript modular.

Apoi rulează:

```bash
python scripts/build.py
python scripts/verify.py
```

## Structură

- `site/` — deploy final;
- `src/` — sursa modulară;
- `scripts/build.py` — reconstruiește bundle-urile/pagina;
- `scripts/verify.py` — toate verificările;
- `tests/` — testele individuale;
- `audit/` — rapoarte;
- `docs/` — securitate/deploy/legacy;
- `MODIFICARI_COMPLETE.md` — lista detaliată a lucrărilor efectuate.

## Dependențe pentru verificări

```bash
pip install -r requirements-dev.txt
```

Este necesar și Node.js pentru `node --check`. Site-ul în sine nu are nevoie de Python/Node ca să ruleze în browser.

## CSS fără `!important`

Versiunea aceasta are 0 `!important` în CSS-ul sursă și în build. Prioritățile vechi au fost migrate controlat; `python scripts/verify.py` verifică automat că regula este respectată.


## Rafinare V3

Versiunea V3 adaugă optimizări de runtime și accesibilitate pentru carusele/popup-uri, elimină stilurile inline din HTML, simplifică specificitatea CSS și extinde `verify.py` astfel încât să ruleze toate testele proiectului. Raportul detaliat este în `audit/V3_RAFINARE.md`.

## V4
V4 centralizează poziționarea popup-urilor și autoplay-ul caruselelor în `popup-manager.js` și `carousel-manager.js`, adaugă swipe pe Banner și CI GitHub. Rulează `python scripts/verify.py` înainte de deploy. Vezi `audit/V4_RAFINARE.md` pentru lista completă.


## V5
V5 adaugă imagini responsive pentru Banner, repară saltul Cronologiei la load, îmbunătățește focusul/tastatura pentru Favorite și UPC și introduce browser smoke în Chromium pe 7 rezoluții.

Verificare locală completă:
```bash
python scripts/verify.py
python scripts/browser_smoke.py --report audit/browser-smoke.json
```

Pentru capturi de verificare:
```bash
python scripts/browser_smoke.py --screenshots audit/v5-browser-final
```

Vezi `audit/V5_RAFINARE.md`.

## V6 — code hygiene / clean architecture

V6 curăță codul fără redesign:

- **0 CSS conflict chains**;
- **0 dead CSS candidates** detectabile de analizor;
- **0 `!important`**;
- 695 declarații superseded și 329 selectori/ramuri moarte eliminate;
- quality gate în `scripts/code_quality.py`;
- browser smoke Chromium pe 7 rezoluții;
- cache version `20260920.6`.

Verificare recomandată înainte de orice deploy:

```bash
python scripts/verify.py
```

Pentru auditul V6 vezi `audit/V6_CLEAN_ARCHITECTURE.md`.


## FINAL PRODUCTION — V7

V7 este release-ul final de frontend peste V6:

- filtrele avansate folosesc acum butoane HTML native în loc de `div role=button`;
- skip-link către conținutul principal pentru navigare cu tastatura;
- performance budgets pentru HTML/CSS/JS/assets/deploy;
- cross-browser smoke pregătit pentru Chromium + Firefox + WebKit în GitHub Actions;
- Lighthouse CI configurat pentru Performance, Accessibility, Best Practices și SEO;
- rapoartele de quality sunt salvate ca artifacts în GitHub Actions;
- cache version `20260920.7`.

Local, rulează:

```bash
python scripts/verify.py
```

Cross-browser complet este executat în CI, unde sunt instalate toate cele trei motoare Playwright.
Vezi `audit/FINAL_PRODUCTION.md`.

## V11
- Bannerul din dreapta a fost ridicat vizibil mai sus, ca imaginea să înceapă din zona „în prim plan AniVortex”, nu mai jos.
- Offset-ul desktop al imaginii a fost redus de la 54px la 18px, iar spațiul superior din coloana dreaptă a fost redus de la 74px la 42px.
- Pentru tabletă și mobil au fost reduse similar offset-urile, astfel încât poziția să rămână coerentă pe toate ecranele.
- Asset version ridicată la `20260920.10` pentru a evita cache-ul vechi după deploy.
