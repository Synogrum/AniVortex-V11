# AniVortex V6 — Clean Architecture / Code Hygiene

## Obiectiv

V6 este o rundă dedicată exclusiv curățării și stabilizării codului fără redesign. Baza este V5.

## Rezultate măsurabile

- CSS source V5: **714,794 bytes / 29,634 linii**.
- CSS source V6: **647,997 bytes / 28,062 linii**.
- Reducere CSS: **66,797 bytes** și **1,572 linii**.
- Declarații CSS superseded eliminate: **695**.
- Ramuri/selectori CSS morți eliminați: **329**.
- Conflict chains CSS pentru același selector + context + proprietate: **0**.
- `!important`: **0**.
- ID-uri HTML duplicate: **0**.
- handler-e inline / `style=""` în sursa HTML: **0**.
- debug code (`debugger`, `console.log/debug/trace`, `eval`, `new Function`, `document.write`): blocat de quality gate.
- browser smoke: **7/7 viewports PASS**.
- validare deploy: **410/410 fișiere, 0 erori**.

## Curățare CSS

Au fost introduse două instrumente de audit/refactorizare:

- `scripts/prune_css_overrides.py`
  - detectează declarații suprascrise de același selector în același context;
  - păstrează audit TSV pentru fiecare declarație eliminată;
  - suportă și consolidare completă controlată cu `--all-properties`.

- `scripts/prune_dead_css.py`
  - detectează ramuri de selector imposibile deoarece clasele/ID-urile nu mai există în HTML/JS;
  - protejează prefixele de clase generate dinamic din JavaScript;
  - elimină numai ramurile high-confidence.

Rapoarte:

- `audit/css-overrides-pruned.tsv` — 336 declarații layout/typography;
- `audit/css-overrides-pruned-visual.tsv` — 81 declarații vizuale simple;
- `audit/css-overrides-pruned-nested.tsv` — 194 declarații responsive/nested;
- `audit/css-overrides-pruned-all.tsv` — 84 declarații finale;
- `audit/dead-css-pruned.tsv` + `audit/dead-css-pruned-second-pass.tsv` — 329 ramuri/selectori morți;
- `audit/css-conflicts.tsv` — trebuie să rămână doar headerul, adică 0 conflict chains.

## Quality gate nou

Au fost adăugate:

- `quality-gates.json`
- `scripts/code_quality.py`

Gate-ul verifică automat:

- sintaxa tuturor modulelor JS prin `node --check`;
- parsarea CSS;
- `!important` și `@import`;
- debug/risky JS patterns;
- ID-uri HTML duplicate;
- inline style/event handlers;
- selectori CSS morți;
- override-uri redundante;
- conflict chains CSS — buget final **0**;
- limite de complexitate pentru fișiere CSS/JS.

## CI / verify

`.github/workflows/verify.yml` folosește acum un singur production gate:

```bash
python scripts/verify.py
```

Acesta include și `scripts/code_quality.py` și browser smoke în Chromium după instalarea Playwright/Chromium în CI.

## Stabilitate program zilnic

Centrarea zilei active din `Serii programate` este acum deterministă:

1. imediat după inițializare;
2. în următorul `requestAnimationFrame`;
3. după `document.fonts.ready`.

Acest lucru elimină dependența de timing-ul layout/fonturilor.

## Guard-ul de specificitate

S-a testat eliminarea completă a:

```css
:not(#__av_prio_a#__av_prio_b)
```

Browser smoke simplu trecea, dar comparația deterministă V6 pre/post a arătat regresii mari de layout (mii de elemente deplasate; Banner/wrapper cu diferențe de 14–32px și modificări de înălțime a paginii). Modificarea a fost **revertată**.

Prin urmare, guard-ul rămâne intenționat în V6. El nu reprezintă un conflict activ; este mecanismul de specificitate care păstrează designul după eliminarea `!important`. V6 are în continuare **0 conflict chains** în raportul de quality gate.

## Verificare browser

`scripts/browser_smoke.py` verifică:

- 360×800
- 390×844
- 430×932
- 768×1024
- 1366×768
- 1920×1080
- 2560×1440

Rezultat V6: **PASS 7/7**.

## Ce nu a fost schimbat

- Nu s-a făcut redesign.
- Nu s-au schimbat intenționat culorile/structura componentelor.
- Nu s-a introdus framework nou.
- Backend-ul continuă să nu existe; login/favorite/date reale vor necesita securitate server-side când se implementează backend-ul.
