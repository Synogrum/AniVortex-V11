# AniVortex — lista completă a modificărilor

## Actualizare V5

- deploy curent: **410 fișiere validate, 0 erori**;
- eliminat bug-ul care muta pagina la Cronologie imediat după load;
- Banner: 10 imagini cu variante responsive 600/900/1200, economie medie ~**76.2%** pentru 600w;
- UPC: stare `aria-expanded` reală și focus restaurat la Escape;
- Favorite: ArrowUp/Down, Home/End, Escape și focus management;
- test real Chromium pe 360/390/430/768/1366/1920/2560;
- CI GitHub rulează și browser smoke;
- cache assets `20260920.5`;
- raport complet: `audit/V5_RAFINARE.md`.


## Rezultat

Proiectul original a fost auditat, reorganizat și întărit fără redesign intenționat. CSS-ul vizual activ a fost păstrat în aceeași ordine și cu același conținut pentru componentele existente; schimbările vizibile sunt limitate la corecturi tehnice care nu ar trebui să modifice aspectul.

- Proiect original extras: ~212 MB, cu producție + preview-uri + design-uri + fișiere temporare amestecate.
- Folder publicabil final `site/`: 387 fișiere, ~22,4 MB (aprox. 21,4 MiB).
- Imagini raster analizate pentru optimizare: 96.886.531 bytes.
- 145 imagini grele convertite la WebP high-quality.
- Economie numai din conversia imaginilor: 78.752.522 bytes (aprox. 75,1 MiB).
- 517 imagini din HTML: 0 fără `width`/`height`; 506 sunt lazy-loaded.
- 384 butoane: 0 fără `type`.
- 0 event handlers inline în HTML.
- 0 linkuri `target="_blank"` fără `noopener noreferrer`.
- 0 referințe `/public/...` root-relative rămase în HTML.
- Toate cele 387 fișiere deploy au fost validate; 0 erori în raportul final.
- Toate testele automate incluse trec.

## 1. Organizarea proiectului

### Înainte
Fișierele principale (`index.html`, CSS și JS) stăteau în root împreună cu preview-uri, capturi, prototipuri, foldere temporare și versiuni vechi.

### Acum
- `site/` = exact ce trebuie publicat.
- `src/` = sursa modulară, ușor de editat.
- `scripts/` = build și verificare.
- `tests/` = verificări automate.
- `audit/` = rapoarte tehnice.
- `docs/` = documentație și fișiere legacy.

Fișierele CSS active sunt în `site/assets/css/`, iar JavaScript în `site/assets/js/`. Materialele vechi/nefolosite nu mai sunt amestecate cu deploy-ul.

## 2. `index.html`

Am modificat `index.html` pentru:

- a corecta referința CSS inexistentă către `assets/css/base.css`;
- a folosi noile căi organizate `assets/css/*` și `assets/js/*`;
- a adăuga `meta description`, canonical, Open Graph și `theme-color`;
- a adăuga și întări Content Security Policy;
- a adăuga `Referrer-Policy` prin meta;
- a elimina handler-ele JavaScript inline (`onclick` etc.);
- a securiza linkurile care deschid tab nou cu `noopener noreferrer`;
- a face linkurile placeholder inactive în loc să trimită spre pagini inexistente;
- a uniformiza domeniul la `animevortex.site`;
- a normaliza 50 de căi de imagini din `/public/...` în `public/...`, astfel încât preview-ul local/subpath să fie mai robust;
- a adăuga dimensiuni intrinseci tuturor imaginilor locale din HTML;
- a adăuga `decoding="async"` și lazy loading pentru imaginile non-critice;
- a păstra imaginea principală Naruto ca imagine critică și a-i adăuga `fetchpriority="high"`;
- a preîncărca imaginea principală pentru LCP;
- a adăuga favicon;
- a adăuga `type="button"` la 212 butoane care nu îl aveau;
- a adăuga nume accesibile celor două câmpuri text de căutare;
- a scoate din tab-order 78 linkuri marcate ca inactive;
- a adăuga etichete accesibile butoanelor icon-only care nu aveau nume.

## 3. Content Security Policy și securitate frontend

Politica CSP finală limitează:

- scripturile la aceeași origine;
- handler-ele JavaScript inline prin `script-src-attr 'none'`;
- obiectele/pluginurile prin `object-src 'none'`;
- iframe-urile încărcate de pagină prin `frame-src 'none'`;
- tag-ul `base` prin `base-uri 'none'`;
- formularele prin `form-action 'none'` (site-ul actual nu are formulare reale);
- conexiunile la aceeași origine;
- stilurile externe numai la sursele folosite deja de proiect.

`style-src-attr 'unsafe-inline'` rămâne necesar deoarece designul actual folosește stilizare dinamică din JavaScript (`element.style`, custom properties, poziționarea popup-urilor etc.). Eliminarea ei ar necesita refactorizarea comportamentului vizual, nu doar o schimbare de header.

## 4. `hardening.js`

A fost adăugat un strat separat de comportament defensiv pentru:

- înlocuirea fostelor `onclick` inline cu event delegation;
- blocarea controlată a linkurilor `aria-disabled="true"`;
- reacții statice fără JS inline;
- statusul profilului fără JS inline;
- apelarea funcțiilor existente pentru modal/recompense/donații;
- închiderea meniului de status la click în exterior;
- adăugarea defensivă a `noopener noreferrer` și linkurilor create dinamic.

## 5. `com.js`

- a fost eliminat un `onerror="..."` generat dintr-un template HTML; CSP îl bloca și reprezenta un pattern nesigur;
- fallback-ul pentru avatar este acum implementat prin `addEventListener('error', ...)`;
- a fost reparată o referință existentă către `public/imgs/card/17.jpg`, fișier care nu exista;
- referințele către imaginile convertite au fost actualizate la WebP.

## 6. `main.js`

- referințele către imaginile optimizate au fost actualizate;
- accesul la `localStorage` pentru sistemul de recompensă a fost protejat, astfel încât blocarea storage-ului să nu oprească restul paginii;
- logica mare a fost separată în sursă în 10 module, reconstruite automat în `site/assets/js/main.js` pentru a păstra ordinea exactă de execuție:
  - `01-favorites.js`
  - `02-core-widgets.js`
  - `03-series-schedule.js`
  - `04-text-and-counters.js`
  - `05-episode-popup.js`
  - `06-anime-navigation.js`
  - `07-top-suggestions.js`
  - `08-hall-of-fame.js`
  - `09-share.js`
  - `10-profile.js`

## 7. `UPC.js`

- codul a fost păstrat funcțional și mutat în structura nouă;
- referințele/placeholder-ele problematice au fost tratate în etapa de hardening;
- fișierul este verificat cu `node --check` în testele finale.

## 8. JavaScript păstrat fără schimbări funcționale inutile

Următoarele module au fost reorganizate în `assets/js`, dar nu le-am rescris doar de dragul refactorizării, pentru a nu introduce regresii:

- `banner.js`
- `card.js`
- `header.js`
- `trending.js`
- `footer.js`
- `chrono.js`
- `hot-news-new.js`

Ele sunt însă incluse în validarea de sintaxă automată.

## 9. CSS și păstrarea designului

Conținutul CSS vizual activ existent a fost păstrat pentru:

- `header.css`
- `banner.css`
- `body.css`
- `trending.css`
- `chrono.css`
- `footer.css`
- `hot-news-new.css`
- `com.css`
- `main.css`
- `UPC.css`

Cele aproximativ 1.350 de apariții `!important` din codul CSS au fost eliminate/migrate controlat. Declarațiile care aveau nevoie de prioritate sunt separate de declarațiile normale și primesc o creștere constantă de specificitate printr-un guard `:not(...)` care nu filtrează elementele reale. Astfel, ordinea relativă dintre vechile reguli prioritare este păstrată fără `!important`. Cele două apariții din keyframes au fost curățate direct, deoarece `!important` nu are efect în declarațiile de keyframe. A fost eliminată și prioritatea `important` setată din JavaScript pentru popup-ul Trending.

### `main.css` este împărțit în sursă în 10 module

- foundation
- hall-of-fame
- navigation
- sidebar-layout
- sidebar-effects
- favorites
- layout-adjustments
- news-and-effects
- top-suggestions
- responsive-final

### `com.css` este împărțit în 7 module

Core, layout, refinement, header, symbols, art și final overrides.

### `trending.css` este împărțit în 6 module

Core, popup, responsive, refinements, effects și final overrides.

### `banner.css` este împărțit în 5 module

Core, layout, transition, color merge și final.

Fișierele finale din `site/assets/css/` sunt bundle-urile reconstruite, astfel încât browserul primește aceeași ordine a regulilor ca înainte.

## 10. `hardening.css`

A fost adăugat pentru reguli defensive care nu urmăresc redesign:

- `max-width: 100%` pentru imagini;
- stare cursor pentru elementele dezactivate;
- `:focus-visible` pentru navigarea cu tastatura;
- respectarea `prefers-reduced-motion` pentru utilizatorii care dezactivează animațiile.

## 11. Optimizarea imaginilor

Am analizat toate imaginile PNG/JPG/JPEG din `site/public/`.

Regula folosită:

- conversie la WebP quality 95;
- aceeași rezoluție;
- păstrarea canalului alpha/transparenței;
- fișierul original este înlocuit numai dacă WebP este cu cel puțin 5% mai mic;
- imaginile pentru care WebP nu aduce un câștig real rămân în formatul original.

Rezultat:

- 145 fișiere convertite;
- 78.752.522 bytes economisiți;
- folderul cu assets este mult mai mic;
- toate referințele din HTML/JS au fost actualizate;
- toate imaginile HTML au dimensiuni declarate pentru reducerea CLS.

Lista completă, imagine cu imagine, înainte/după, rezoluție și cale nouă este în:

`audit/image-optimization.tsv`

## 12. HTML modular

`src/html/index/` conține acum pagina împărțită în 14 părți:

- shell/header/banner
- trending
- share transition
- comments
- main left
- main center
- main right
- chronology
- entertainment shell
- live-action carousel
- movies/series carousel
- books carousel
- entertainment close
- footer/scripts/document close

`site/index.html` este generat prin concatenarea lor în ordinea din `build-manifest.json`.

## 13. Build fără framework și fără npm obligatoriu

A fost adăugat:

`scripts/build.py`

Comenzi:

```bash
python scripts/build.py
python scripts/build.py --check
```

`--check` nu modifică nimic; verifică dacă `site/` corespunde exact cu `src/`.

## 14. Teste automate adăugate

- `tests/site_checks.py` — resurse locale, ID-uri duplicate, handlers inline, CSP, linkuri, butoane și JS;
- `tests/security_checks.py` — CSP întărit, lipsa event-handler markup în JS, lipsa `eval`, `new Function`, `document.write`;
- `tests/assets_checks.py` — imagini existente, dimensiuni, căi `/public`, asset-uri JS;
- `tests/accessibility_checks.py` — tip butoane, input-uri cu nume accesibil, linkuri inactive scoase din tab-order;
- `tests/performance_checks.py` — preload/fetch priority pentru imaginea LCP și favicon;
- `tests/source_checks.py` — build identic, sintaxă JS pentru modulele din `src/`, parsare CSS pentru toate modulele;
- `scripts/validate_files.py` — validează toate fișierele deploy și produce raport TSV;
- `scripts/verify.py` — rulează toate verificările într-o singură comandă.

Comanda finală:

```bash
python scripts/verify.py
```

Rezultat la livrare: **ALL CHECKS PASS**.

## 15. Fișiere de deploy adăugate

- `site/robots.txt`
- `site/404.html`
- `site/CNAME` cu `animevortex.site`
- `site/.nojekyll` pentru publicare statică pe GitHub Pages

`sitemap.xml` a fost păstrat și verificat.

## 16. Fișiere legacy

`base.css` și `swap.js` nu sunt încărcate de site-ul final și sunt păstrate în `docs/legacy/` pentru referință, în loc să stea în producție.

## 17. Rapoarte incluse

- `audit/AUDIT_COMPLET.md` — auditul tehnic;
- `audit/file-validation.tsv` — cele 677 de fișiere din arhiva originală;
- `audit/code-files.tsv` — inventarul fișierelor de cod originale;
- `audit/active-code-comparison.tsv` — comparația hash/size pentru fișierele active originale vs. finale;
- `audit/image-optimization.tsv` — fiecare imagine optimizată/menținută;
- `audit/validation-final.tsv` — validarea tuturor celor 387 fișiere publicabile.

## 18. Ce nu am modificat intenționat

Nu am făcut redesign. Override-urile `!important` au fost înlocuite cu o strategie controlată de cascade/specificitate, iar proiectul are acum un test automat care eșuează dacă `!important` reapare în CSS-ul sursă sau generat. Fișierele mari rămân modularizate pentru refactorizări viitoare componentă cu componentă.

De asemenea, arhiva este frontend static. Nu există backend/API/bază de date. Autentificarea reală, parolele, sesiunea utilizatorului, upload-urile, plățile, autorizarea staff/admin și validarea datelor trebuie securizate server-side când acel backend este implementat.


## 19. Eliminarea finală a `!important`

- 0 apariții `!important` în `src/css/`;
- 0 apariții `!important` în `site/assets/css/`;
- 0 utilizări JS de `setProperty(..., "important")`;
- `scripts/migrate_important.py` documentează metoda de migrare;
- `audit/important-migration.tsv` listează regulile și proprietățile migrate;
- `tests/source_checks.py` previne reintroducerea `!important`;
- build-ul și toate testele automate trec după migrare.

## 20. Rafinare V3 — runtime, carusele, HTML și responsive

Vezi raportul complet `audit/V3_RAFINARE.md`.

Pe scurt:
- 3 MutationObserver Trending → 1;
- popup Favorite + Episode repoziționate prin `rafThrottle`;
- autoplay oprit pe hover/focus pentru componentele rotative;
- navigare UPC cu săgețile tastaturii;
- 20 stiluri inline HTML → 0;
- guard-ul de specificitate redus de la 8 la 2 ID-uri fictive;
- CSS sursă redus cu aproximativ 50 KB față de V2;
- cod JS mort suplimentar eliminat;
- `100dvh`, `touch-action: pan-y` și lazy-decoding suplimentar;
- cache version `20260920.3`;
- `verify.py` rulează acum întreaga suită de teste relevantă;
- rezultat final: `ALL CHECKS PASS`, 388/388 fișiere deploy valide.

## V4 — Manager-e comune și runtime
- Popup Manager comun pentru Trending, UPC, Favorite și popup episoade.
- Carousel Manager comun pentru Banner, Trending, UPC, Top Sugestii și Favorite.
- Swipe mobil pe Banner + `touch-action: pan-y`.
- UPC: keyboard delegation și eliminare reset duplicat.
- Asset version 20260920.4.
- GitHub Actions verifică automat build-ul și toate testele.
- 390/390 fișiere deploy valide, 0 erori, `ALL CHECKS PASS`.
- Detalii: `audit/V4_RAFINARE.md`.

## 21. V6 — curățare completă cod / zero conflicte CSS

- eliminate 695 declarații CSS care erau suprascrise ulterior de același selector în același context;
- eliminate 329 ramuri/selectori CSS fără ținte în HTML/JavaScript;
- CSS-ul sursă a scăzut de la 714,794 bytes / 29,634 linii (V5) la 647,997 bytes / 28,062 linii (V6);
- `audit/css-conflicts.tsv` are 0 conflict chains;
- adăugat `scripts/prune_css_overrides.py`;
- adăugat `scripts/prune_dead_css.py`;
- adăugat `scripts/code_quality.py` + `quality-gates.json`;
- quality gate blochează reintroducerea conflictelor CSS, codului mort detectabil, debug code, ID-urilor duplicate și fișierelor care cresc excesiv;
- centrarea zilei active din Serii programate este stabilizată după layout și încărcarea fonturilor;
- GitHub Actions rulează production gate-ul complet;
- browser smoke V6 trece la 360/390/430/768/1366/1920/2560;
- guard-ul de specificitate `:not(#__av_prio_a#__av_prio_b)` a fost testat pentru eliminare, dar păstrat deoarece eliminarea produce regresii de layout măsurabile;
- validare finală deploy: 410/410 fișiere valide, 0 erori.

Raport: `audit/V6_CLEAN_ARCHITECTURE.md`.


# V7 — Final Production

## Accesibilitate
- Cele 10 `.dropdown-toggle` din filtre sunt acum butoane native, fără `role=button`/`tabindex` artificiale.
- A fost adăugat un skip-link vizibil la focus către `#mainContent`.

## Performance gates
- index.html <= 800 KiB;
- CSS total <= 700 KiB;
- JS total <= 300 KiB;
- cel mai mare CSS <= 330 KiB;
- cel mai mare JS <= 120 KiB;
- cel mai mare asset <= 500 KiB;
- deploy total <= 26 MiB.

## Cross-browser / Lighthouse
- `scripts/cross_browser_smoke.py` testează Chromium, Firefox și WebKit pe cele 7 viewport-uri standard.
- GitHub Actions instalează toate cele trei motoare și rulează testul.
- `lighthouserc.json` generează audituri Performance / Accessibility / Best Practices / SEO în CI.
- Rapoartele sunt păstrate ca artifact `anivortex-quality-reports`.

## Release
- asset/cache version: `20260920.7`.

## V11
- Bannerul din dreapta a fost ridicat vizibil mai sus, ca imaginea să înceapă din zona „în prim plan AniVortex”, nu mai jos.
- Offset-ul desktop al imaginii a fost redus de la 54px la 18px, iar spațiul superior din coloana dreaptă a fost redus de la 74px la 42px.
- Pentru tabletă și mobil au fost reduse similar offset-urile, astfel încât poziția să rămână coerentă pe toate ecranele.
- Asset version ridicată la `20260920.10` pentru a evita cache-ul vechi după deploy.
