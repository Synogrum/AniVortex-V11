# Publicare AniVortex

## GitHub Pages

Publică **conținutul folderului `site/`** în rădăcina sursei GitHub Pages.

În `site/` sunt incluse:

- `CNAME` → `animevortex.site`;
- `.nojekyll`;
- `robots.txt`;
- `sitemap.xml`;
- `404.html`.

Înainte de publicare rulează:

```bash
python scripts/build.py
python scripts/verify.py
```

Nu este necesar să publici `src/`, `audit/`, `docs/`, `tests/` sau `scripts/`.

## Headere HTTP

GitHub Pages nu oferă control complet asupra headerelor custom. Dacă site-ul trece printr-un CDN/proxy care permite headere, mută CSP la nivel HTTP și adaugă `X-Content-Type-Options: nosniff`, o `Permissions-Policy` minimă și HSTS doar după ce HTTPS este stabil pentru toate subdomeniile relevante.
