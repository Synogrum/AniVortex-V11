# AniVortex — FINAL PRODUCTION V7

## Stare

V7 este release-ul final de frontend rezultat din V1–V6 + ultima rundă de production hardening.

### Garanții locale verificate

- build determinist din `src/` către `site/`;
- 0 `!important`;
- 0 CSS conflict chains conform quality gate;
- 0 dead CSS candidates conform analizorului conservator;
- security/accessibility/assets/source/runtime tests;
- performance budgets;
- Chromium browser smoke la 360, 390, 430, 768, 1366, 1920 și 2560 px;
- zero document horizontal overflow în smoke test;
- keyboard behavior testat pentru Favorite și UPC;
- 10 filter toggles convertite la butoane native;
- skip-link către conținutul principal.

## Cross-browser

`scripts/cross_browser_smoke.py` este pregătit pentru Chromium, Firefox și WebKit. Mediul local al sesiunii are doar Chromium instalat și blochează download-ul Firefox/WebKit, de aceea testul local executat este Chromium. GitHub Actions instalează toate cele trei motoare și rulează cross-browser smoke la fiecare push/PR.

## Lighthouse

`lighthouserc.json` configurează Lighthouse CI pentru Performance, Accessibility, Best Practices și SEO. Rapoartele sunt salvate în `audit/lighthouse/` și încărcate ca artifact în GitHub Actions.

Scorurile Lighthouse nu sunt declarate ca rezultate locale, deoarece mediul sesiunii blochează navigarea browserului către localhost. Threshold-urile sunt inițial warnings pentru a obține un baseline real în CI înainte de a le transforma în hard failures.

## Performance budget V7

- `index.html`: max 800 KiB;
- CSS total: max 700 KiB;
- JS total: max 300 KiB;
- largest CSS: max 330 KiB;
- largest JS: max 120 KiB;
- largest asset: max 500 KiB;
- total deploy: max 26 MiB.

## Deploy

Publică conținutul folderului `site/`. Sursa editabilă rămâne în `src/`.

## Backend

V7 finalizează frontend-ul static. Login-ul real, conturile, favoritele persistente, comentariile persistente și datele utilizatorilor trebuie implementate ulterior într-un backend/API cu autentificare și autorizare server-side; nu sunt simulate ca „securitate” în frontend.
