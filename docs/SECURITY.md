# Securitate AniVortex

Proiectul livrat este frontend static. Au fost aplicate măsurile de securitate care pot fi controlate din acest nivel:

- Content Security Policy;
- `script-src-attr 'none'`;
- `object-src 'none'`;
- `frame-src 'none'`;
- `base-uri 'none'`;
- `form-action 'none'`;
- Referrer Policy;
- eliminarea JavaScript-ului inline;
- protecție `noopener noreferrer`;
- linkuri placeholder inactive;
- fallback-uri JS fără event handler HTML inline;
- teste pentru `eval`, `new Function` și `document.write`.

`style-src-attr 'unsafe-inline'` este încă necesar fiindcă interfața actuală modifică stiluri din JavaScript pentru popup-uri, carusele și animații. Refactorizarea completă a acestui punct trebuie făcută împreună cu testare vizuală.

## Backend

Arhiva nu conține backend/API/bază de date. Orice autentificare reală, sesiune, rol staff/admin, upload, plată sau comentariu persistent trebuie protejat server-side cu validare, autorizare, rate limiting, cookies sigure, protecție CSRF unde este cazul, hash modern pentru parole și secret management.
