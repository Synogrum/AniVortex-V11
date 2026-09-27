# AniVortex V12 — Header + Banner Style Template

Status: **HB-01 applied as V12.17 canonical preview** — this file is now the working decision sheet for Header + Banner.  
Scope: **Header + Banner only**.  
Branch: `v12-design-system`.  
Important: no visual CSS change is implied by this document until the values below are approved.

## 1. Direction

Current problem: the page background is dark emerald (`#031711`) and the foreground Header/Banner controls also use emerald/teal surfaces, so the foreground does not separate strongly enough from the page.

Current preview variant: **HB-01 — Obsidian + Champagne**.

Recommended direction for Header + Banner:
- base surfaces: **obsidian / graphite / midnight**, not green;
- premium accent: **champagne gold**;
- optional secondary accent: **cool ice/cyan**, used sparingly;
- primary text: warm off-white;
- secondary text: cool neutral gray;
- green remains mostly in the page background, not in major foreground surfaces.

### Applied preview palette HB-01 — V12.17

| Role | Proposed value | Decision |
|---|---|---|
| Header base | `#0B1016` / `rgba(11,16,22,.95)` | APPLIED V12.17 |
| Header elevated glass | `#111923` | APPLIED V12.17 |
| Banner control surface | `#10151D` / `#121923` | APPLIED V12.17 |
| Banner secondary surface | `#171E28` | TBD |
| Primary text | `#F7F4EC` | APPLIED V12.17 |
| Secondary text | `#C1C9D2` | APPLIED V12.17 |
| Muted text | `#8792A0` | APPLIED V12.17 |
| Premium accent | `#D4B77A` | APPLIED V12.17 |
| Premium dark | `#B8925E` | APPLIED V12.17 |
| Optional cool accent | `#72CFE8` | APPLIED V12.17 |
| Border neutral | `rgba(255,255,255,.10)` | TBD |
| Border premium | `rgba(212,183,122,.28)` | TBD |

---

# 2. Typography system

Fonts already loaded by the project:
- **Outfit** — weights 700 / 800 / 900
- **Inter** — weights 500 / 600 / 700 / 800
- **Space Grotesk** — weights 500 / 600 / 700

Current global body font: **Outfit**.

Recommended hierarchy for this Header + Banner redesign:

| Text role | Current effective style | Proposed baseline | Decision |
|---|---|---|---|
| Header navigation | Outfit, 13.5px, 600 | **Inter, 14px, 600** | TBD |
| Header tooltip | Outfit, 11px, 600 | **Inter, 11px, 600** | TBD |
| Search text | Outfit, 13.5px | **Inter, 14px, 500** | TBD |
| Banner rank label | Outfit, 14px, 900, uppercase | **Inter, 12px, 700, uppercase** | TBD |
| Banner brand label | Outfit, 12px, 700, uppercase | **Inter, 11px, 600, uppercase** | TBD |
| Anime title | Outfit, 34–42px, 900 | **Outfit, 46–54px, 900** | TBD |
| Genres | Outfit, 18px, 800 | **Inter, 17px, 700** | TBD |
| SUB / DUB | Outfit, 13px | **Inter, 12px, 700** | TBD |
| Metadata large | Outfit, 15px, 700 | **Inter, 14px, 700** | TBD |
| Metadata normal | Outfit, 13px, 600 | **Inter, 13px, 600** | TBD |
| Description | Outfit, 16px, inherited weight | **Inter, 16px, 500** | TBD |
| CTA buttons | Outfit, 18px, 900 | **Inter, 15px, 700** | TBD |
| Image side label | Outfit, 42px, 900 | **Outfit, 34–40px, 800** | TBD |
| Info tooltip | Outfit, 12px, 700 uppercase | **Inter, 11px, 700 uppercase** | TBD |

---

# 3. Header — current effective values

The values below include the active overrides from `hardening.css`, not only the original `header.css`.

| Element | Selector | Current effective design | Proposed HB-01 | Decision |
|---|---|---|---|---|
| Header shell | `.header` | green/emerald glass gradient; emerald border | Obsidian glass `rgba(11,16,22,.92)` + neutral/gold border | TBD |
| Header shell scrolled | `.header.scrolled` | darker emerald glass | `rgba(8,12,17,.96)` | TBD |
| Header smoke/glow | `.smoke`, `.inner-haze` | teal/green glow | neutral blue-gray + very weak gold highlight | TBD |
| Hamburger | `.hamburger span` | white 90% | `#EDEFF2` | TBD |
| Navigation text | `.nav-item > a` | white 94%, 13.5px, 600 | `#E9EDF2`, Inter 14/600 | TBD |
| Navigation hover | nav hover | white + white translucent surface | graphite surface + gold/cool underline or glow | TBD |
| Dropdown surface | `.dropdown` | emerald via theme override | `#101720` / 96% | TBD |
| Dropdown text | `.dropdown li a` | `var(--text-dim)` | `#B6C0CC` | TBD |
| Header icon buttons | `.action-btn` | emerald gradient due theme override | graphite `#121923` | TBD |
| Header icon color | `.action-btn i` | `#F1F4F8` | `#EAF0F5` | TBD |
| Icon button hover | action hover | brighter green | gold/cool highlight over graphite | TBD |
| Search surface | `.search-box input` | emerald gradient | `#111923` | TBD |
| Search text | input text | `#F1F4F8`, Outfit 13.5 | `#EFF2F5`, Inter 14/500 | TBD |
| Search placeholder | placeholder | white 52% | `#7F8A98` | TBD |
| Tooltip | `.tooltip` | dark blue/gray, white text | keep dark-neutral family | TBD |
| Divider | `.right-separator` | white gradient line | neutral white 12–22% | TBD |

---

# 4. Banner — current effective values

Important: the Banner shell is currently transparent, therefore the large green page canvas is visible directly behind the Banner. Several internal controls are also recolored emerald by `hardening.css`.

| Element | Selector | Current effective design | Proposed HB-01 | Decision |
|---|---|---|---|---|
| Banner shell | `.banner` | transparent over green page; emerald border | dark neutral translucent panel OR transparent with stronger neutral content layer | TBD |
| Banner border | `.banner` | emerald `rgba(96,230,193,.18)` | gold-neutral `rgba(212,183,122,.20)` | TBD |
| Rank badge | `.top-badge` | transparent white glass | dark graphite glass | TBD |
| Rank text | `.top-rank` | `#F3D46B`, 14px, 900 | `#D4B77A`, Inter 12/700 | TBD |
| AniVortex mini label | `.top-brand` | white 45%, 12px, 700 | `#8793A1`, Inter 11/600 | TBD |
| Anime title | `.title-text` | gold gradient, Outfit 34–42/900 | warm ivory + gold accent OR retained gold | TBD |
| Genre text | `.genre-row` | `#F7E7A1`, 18px, 800 | `#E7EBF0`, Inter 17/700 | TBD |
| Genre separators | `.sep` | gold | gold | TBD |
| SUB badge | `.tag-sub` | warm gold/brown glass | cool slate / ice accent | TBD |
| DUB badge | `.tag-dub` | gold/green glass | warm gold accent | TBD |
| Meta large | `.meta-big` | **emerald gradient due hardening** | graphite `#121923` | TBD |
| Meta normal | `.meta-item` | **emerald gradient due hardening** | graphite `#121923` | TBD |
| Meta text | meta text | `#F1F4F8` | `#E7EBF0` | TBD |
| Description | `.description` | white 80%, 16px, 1.65 | `#B8C1CC`, Inter 16/500, 1.65 | TBD |
| Primary CTA | `.btn-view` | **green/teal due hardening** | gold accent on dark surface | TBD |
| Primary CTA text | `.btn-content` | **green gradient text due hardening** | warm ivory or gold | TBD |
| Secondary CTA | `.btn-details` | green-tinted dark glass | neutral graphite glass | TBD |
| Secondary CTA text | `.btn-content-light` | white | `#E9EDF2` | TBD |
| Image frame | `.image-card` | emerald border/glow through theme | neutral/gold border + dark shadow | TBD |
| Side label | `.center-text-label` | white 90%, Outfit 42/900 | off-white, Outfit 34–40/800 | TBD |
| Info button | `.info-button` | **emerald gradient due hardening** | graphite + gold/cool icon | TBD |
| Info tooltip | `.info-tooltip` | **emerald gradient due hardening** | `#101720` | TBD |

---

# 5. What is currently causing “green on green”

These are the active theme rules that should be replaced when the visual direction is approved:

- `body.av-theme-c .header`
- `body.av-theme-c .header.scrolled`
- `body.av-theme-c .smoke`
- `body.av-theme-c .smoke.smoke-2`
- `body.av-theme-c .inner-haze`
- `body.av-theme-c .dropdown`
- `body.av-theme-c .action-btn`
- `body.av-theme-c .search-box input`
- `body.av-theme-c .meta-big`
- `body.av-theme-c .meta-item:not(.meta-big)`
- `body.av-theme-c .info-button`
- `body.av-theme-c .info-tooltip`
- `body.av-theme-c .btn-view`
- `body.av-theme-c .btn-gradient`
- `body.av-theme-c .btn-content`
- `body.av-theme-c .btn-details`
- `body.av-theme-c .image-card`

These currently live in `hardening.css` and are the main reason Header/Banner foreground surfaces remain green/teal.

---

# 6. Approval workflow

For each item, choose one of:
- **KEEP** — keep current value;
- **HB-01** — use the proposed baseline;
- **CUSTOM** — specify the exact font/color/size/background you want.

Example:
`Anime title → CUSTOM: Outfit 900, 50px, #F7F4EC`

Once approved, the chosen values should be moved into dedicated Header/Banner design tokens and applied in the original Header/Banner CSS, while the corresponding Header/Banner theme overrides are removed from `hardening.css`.
