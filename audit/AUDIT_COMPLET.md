# Audit tehnic final AniVortex

## Rezumat

Arhiva originală a conținut 677 fișiere și aproximativ 212 MB după extragere. Proiectul amesteca fișiere de producție cu preview-uri, design-uri și fișiere temporare. Versiunea finală separă sursa de deploy și păstrează în `site/` doar partea necesară publicării.

### Stare finală

- `site/`: 387 fișiere, ~22,4 MB;
- validare finală: 387/387 fișiere OK;
- toate testele automate: PASS;
- 145 imagini convertite la WebP high-quality;
- 78.752.522 bytes economisiți prin conversia imaginilor;
- 517 imagini HTML, 0 fără dimensiuni;
- 384 butoane, 0 fără `type`;
- 0 event handlers inline;
- 0 linkuri `_blank` fără `noopener noreferrer`;
- 0 referințe `/public/...` root-relative;
- CSP întărit și referrer policy prezentă;
- 0 `!important` în CSS-ul sursă și generat;
- 0 prioritate `important` setată din JavaScript.

## Probleme inițiale confirmate și rezolvate

1. `index.html` era foarte mare și greu de întreținut. Sursa este acum împărțită în 14 parțiale HTML și reconstruită automat.
2. `main.css` (~13,8k linii) era monolitic. Sursa este împărțită în 10 module, dar bundle-ul final păstrează exact ordinea CSS.
3. `main.js` (~3,1k linii) era monolitic. Sursa este împărțită în 10 module și bundle-ul final este generat automat.
4. `com.css`, `trending.css` și `banner.css` au fost modularizate în sursă fără reordonarea regulilor finale.
5. Exista o referință CSS lipsă și fișiere legacy amestecate cu producția. Au fost scoase din deploy și păstrate în `docs/legacy/`.
6. Exista JavaScript inline în HTML. A fost eliminat și mutat în event delegation.
7. Linkurile `target="_blank"` nu erau toate protejate. Acum folosesc `noopener noreferrer`.
8. Linkurile placeholder duceau către destinații inexistente. Sunt marcate inactive și nu mai produc navigări 404 accidentale.
9. Imaginile nu aveau dimensiuni/loading. Acum toate au dimensiuni, iar imaginile non-critice sunt lazy-loaded.
10. 50 de căi `/public/...` au fost normalizate pentru portabilitate.
11. O imagine folosită în comentarii (`public/imgs/card/17.jpg`) nu exista. Referința a fost reparată.
12. Un fallback de avatar era implementat cu `onerror` inline într-un template JS. A fost înlocuit cu `addEventListener` compatibil cu CSP.
13. Lipseau reguli de bază CSP/referrer. CSP este acum mai strictă și testată automat.
14. Nu exista un pipeline reproducibil de build/verificare. Acum există `scripts/build.py` și `scripts/verify.py`.

## CSS

Fișierele CSS au fost curățate de `!important`. Declarațiile prioritare au fost migrate controlat la selectori cu un boost constant de specificitate, păstrând ordinea relativă dintre regulile care anterior erau `!important`. În codul CSS sursă și în bundle-urile generate sunt acum 0 apariții `!important`. Testele de sursă verifică această regulă la fiecare rulare.

## JavaScript

Nu au fost găsite `eval()`, `new Function()` sau `document.write()`. Inserările HTML dinamice rămân în câteva componente, dar datele dinamice existente sunt statice sau escapate în modulele relevante. Testele verifică să nu reapară event handlers inline periculoși.

## Securitate

Frontend-ul final are CSP, referrer policy, link hardening și eliminarea handlerelor inline. `style-src-attr 'unsafe-inline'` rămâne necesar deoarece popup-urile și animațiile folosesc `element.style` și custom properties din JavaScript.

Nu există backend în arhivă. Autentificarea reală, parolele, sesiunile, autorizarea, comentariile persistente, upload-urile și plățile trebuie implementate și securizate server-side separat.

## Rapoarte

- `file-validation.tsv` — toate cele 677 fișiere originale;
- `code-files.tsv` — inventarul codului original;
- `active-code-comparison.tsv` — SHA/size original vs final pentru fișierele active;
- `image-optimization.tsv` — conversiile de imagini;
- `validation-final.tsv` — toate cele 387 fișiere deploy validate.

- `important-migration.tsv` — regulile/proprietățile migrate din `!important`.
