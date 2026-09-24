# AniVortex — Rafinare V4

## Obiectiv
V4 continuă V3 fără redesign: centralizează logica popup/carousel, reduce listener-ele duplicate, îmbunătățește interacțiunea mobilă și adaugă verificare CI.

## Modificări principale

### 1. Popup Manager comun
A fost adăugat `src/js/components/popup-manager.js` cu:
- `chooseSide()` pentru alegerea stânga/dreapta;
- `placeAdjacent()` pentru poziționare lângă elementul ancoră;
- `createPositionScheduler()` pentru repoziționare limitată la un frame;
- `bindViewportTracking()` pentru resize/scroll/wheel cu cleanup.

Au fost migrate pe managerul comun:
- Trending;
- UPC;
- Serii favorite;
- popup-urile de episod din Main.

Geometria specifică fiecărei componente a fost păstrată prin opțiuni (gap, fallback side, vertical centering, clamp).

### 2. Carousel Manager comun
A fost adăugat `src/js/components/carousel-manager.js` cu:
- `createAutoplayController()`;
- `bindInteractionPause()`;
- `bindSwipe()`.

Folosesc acum același controler de autoplay:
- Banner;
- Trending;
- UPC;
- Top Sugestii;
- Serii Favorite.

Controlerul respectă automat:
- tab ascuns;
- `prefers-reduced-motion`;
- hover;
- focus din tastatură;
- condiții locale precum popup deschis.

### 3. UPC runtime cleanup
- navigarea ArrowLeft/ArrowRight și Enter/Space este delegată pe container, nu câte un listener pe fiecare card;
- a fost eliminat un apel duplicat `resetCardState(incoming)`;
- popup-ul UPC folosește managerul comun de poziționare și viewport tracking.

### 4. Banner mobil
- swipe stânga/dreapta prin `Carousel Manager`;
- `touch-action: pan-y` păstrează scroll-ul vertical nativ;
- autoplay-ul este oprit în timpul interacțiunii și repornit controlat.

### 5. Build/cache
- versiunea asset-urilor este acum `20260920.4`;
- noile manager-e sunt incluse înaintea componentelor care depind de ele.

### 6. CI GitHub
A fost adăugat `.github/workflows/verify.yml`. La push și pull request rulează:
1. checkout;
2. Python 3.12;
3. Node 20;
4. dependențele de validare;
5. `python scripts/build.py --check`;
6. `python scripts/verify.py`.

### 7. Teste noi
Au fost adăugate:
- `popup_manager_checks.py`;
- `carousel_manager_checks.py`;
- `upc_runtime_quality_checks.py`;
- `swipe_manager_checks.py`;
- `ci_checks.py`;
- `manager_behavior_checks.js`.

`verify.py` rulează acum și aceste teste.

## Validare finală
- build sincronizat: PASS;
- securitate: PASS;
- accesibilitate: PASS;
- asset-uri: PASS;
- CSS: PASS;
- runtime refinements: PASS;
- manager behavior: PASS;
- CI checks: PASS;
- validare deploy: **390/390 fișiere, 0 erori**;
- rezultat: **ALL CHECKS PASS**.

## Dimensiuni sursă
| Metrică | V3 | V4 |
|---|---:|---:|
| Fișiere CSS | 36 | 36 |
| Linii CSS | 29,629 | 29,634 |
| Bytes CSS | 714,672 | 714,794 |
| Fișiere JS | 20 | 22 |
| Linii JS | 6,161 | 6,382 |
| Bytes JS | 239,689 | 246,639 |

Creșterea mică a JS este intenționată: logica duplicată este mutată în două utilitare reutilizabile și protejată cu teste.

## Limită de verificare vizuală
Mediul de execuție a blocat navigarea Chromium către pagini locale (`ERR_BLOCKED_BY_ADMINISTRATOR`), iar încercarea de randare complet inline a depășit limita practică a browserului din container. Din acest motiv V4 este validat prin build, teste de comportament și validatoare statice/runtime simulate; nu pretind o comparație pixel-perfect în Chromium pentru această rundă.
