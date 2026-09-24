# AniVortex — Rafinare V3

Data: 2026-09-20

Această rundă continuă refactorizarea fără redesign intenționat. Accentul a fost pe runtime, carusele, popup-uri, responsive, accesibilitate, curățenia HTML/CSS și calitatea verificărilor automate.

## Rezultate măsurabile V2 → V3

| Măsură | V2 | V3 |
|---|---:|---:|
| CSS sursă | 764.918 bytes | 714.672 bytes |
| Linii CSS sursă | 29.638 | 29.665 |
| JS sursă | 238.548 bytes | 239.689 bytes |
| Linii JS sursă | 6.189 | 6.180 |
| `style=""` în HTML sursă | 20 | 0 |
| markere ID pentru specificitate | 5.704 | 1.426 |
| MutationObserver în Trending | 3 | 1 |
| teste individuale în folderul tests | 18 | 21 |
| fișiere deploy validate | 388 | 388 |

CSS-ul are puțin mai multe linii deoarece valorile scoase din HTML inline au fost mutate în clase declarative, dar este cu aproximativ 50 KB mai mic datorită simplificării mecanismului de specificitate.

## Runtime / JavaScript

- Cele trei `MutationObserver` separate din efectele Trending au fost unite într-un singur observer incremental.
- Observerul procesează numai nodurile nou adăugate, în loc să rescaneze toate cardurile pentru fiecare efect V31/V32/V33.
- Popup-ul „Serii favorite” își recalculează poziția pe scroll/resize cel mult o dată pe frame prin `rafThrottle`.
- Popup-urile episoadelor folosesc aceeași strategie pentru resize.
- UPC păstrează repoziționarea popup-ului throttled.
- Au fost eliminate două ramuri JS moarte: compatibilitatea `#continutZi` și handlerul vechi `#statusDot`; statusul profilului este deja gestionat prin `hardening.js`.
- Scanarea finală a ID-urilor accesate prin `getElementById` nu mai găsește ținte inexistente.

## Carusele și interacțiune

- Trending nu mai înregistrează din nou `mouseenter`/`mouseleave` la fiecare rerandare de categorie.
- Trending oprește autoplay pe hover și focus și îl reia controlat după ieșirea utilizatorului.
- UPC oprește autoplay cât timp focusul tastaturii se află în carusel.
- Cardurile UPC suportă `ArrowLeft` / `ArrowRight` pentru navigarea caruselului.
- Bannerul oprește autoplay la hover/focus și îl reia numai când utilizatorul nu mai interacționează.
- „Top sugestii” oprește rotația pe hover/focus.
- „Serii favorite” oprește rotația și pe focus, nu doar la mouse.
- Toate mecanismele continuă să respecte `prefers-reduced-motion` și vizibilitatea tab-ului.

## Accesibilitate

- Cardurile UPC expun `aria-controls` către popup-ul generat.
- Cardurile UPC expun `aria-haspopup="dialog"`.
- Butoanele de status din „Serii favorite” primesc `aria-controls`, `aria-haspopup="menu"` și stare `aria-expanded` inițială.
- Autoplay-ul se oprește când utilizatorul navighează cu tastatura în componentele rotative.
- HTML-ul sursă nu mai are stiluri inline; stările și valorile vizuale au fost mutate în clase CSS.

## HTML / CSS

- Au fost eliminate toate cele 20 de atribute `style=""` din HTML-ul sursă.
- Progresul de profil, barele utilizatorilor activi, particulele Hall of Fame și culorile social-share au acum clase/reguli CSS explicite.
- Elementele ascunse inițial folosesc clasa reutilizabilă `.av-initially-hidden`.
- Mecanismul de specificitate care a înlocuit `!important` a fost redus de la 8 ID-uri fictive la 2.
- Testul de migrare verifică automat că niciun selector normal nu ajunge la 2 ID-uri; astfel guard-ul rămâne dominant și justificat.
- 0 `!important` rămâne regula proiectului.

## Responsive / performanță

- `body` are fallback `100vh` + `100dvh`, pentru viewport-urile dinamice de pe mobil.
- Popup-ul UPC folosește și `100dvh` pentru limita de înălțime.
- Caruselul UPC are `touch-action: pan-y`, astfel scroll-ul vertical nativ rămâne liber în timp ce drag-ul orizontal este gestionat de componentă.
- Imaginile generate pentru „postări recente” primesc `loading="lazy"` și `decoding="async"`.
- Cache version a fost ridicată la `20260920.3` pentru a evita CSS/JS vechi după deploy.

## Testare

`verify.py` rulează acum întreaga suită relevantă, inclusiv testele care existau dar nu erau chemate de verificarea agregată:

- build consistency;
- producție / resurse;
- securitate;
- asset-uri;
- accesibilitate;
- metadata/performance;
- surse modulare;
- migrare de specificitate;
- duplicate CSS;
- runtime refinements;
- HTML fără inline styles;
- responsive refinements;
- auto-motion;
- cache version;
- heavy assets;
- theme tokens;
- token centralization;
- transition checks;
- dead-code checks;
- helper `rafThrottle`;
- regresia Like/Dislike;
- validarea fișierelor deploy.

Rezultat final: `ALL CHECKS PASS`, 388 fișiere deploy validate, 0 erori.

## Limită a acestei runde

Nu s-a făcut redesign intenționat. Verificarea automatizată structurală și de cod este completă pentru schimbările V3. O rundă ulterioară poate continua cu refactorizarea vizuală responsive pe breakpoint-uri individuale și consolidarea sistemelor de popup într-un manager comun.
