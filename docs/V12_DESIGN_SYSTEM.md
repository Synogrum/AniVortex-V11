# AniVortex V12 — Design System Draft

## Scop
V12 păstrează identitatea vizuală actuală AniVortex și o standardizează pentru desktop, tabletă și mobil.
Nu este un redesign complet. Este o rafinare UI/UX + consistență.

## 1. Identitate de brand

### Culori principale
- Brand background: `#052A2E`
- Surface teal: `#071B21`
- Gold primary: `#D4B77A`
- Gold dark: `#B8925E`
- Text primary: `#F7F7F7`

### Accente secundare
Cyan, mint și blue rămân, dar au roluri clare:
- Cyan = informație / entertainment / highlights
- Mint = success / active / online
- Blue = acțiuni interactive / navigație secundară
- Gold = brand / premium / focus principal

Nu se introduc noi culori accent fără rol definit.

## 2. Suprafețe

Niveluri standard:
- Surface 0: fundal pagină
- Surface 1: secțiune mare
- Surface 2: card/panel
- Surface 3: popup/dropdown/modal

Toate componentele trebuie să folosească una dintre aceste familii, nu fundaluri complet independente.

## 3. Radius

Scală standard:
- 12px = element mic
- 16px = control / button / chip
- 20px = card
- 24px = panel / popup mare

Se evită valori noi arbitrare.

## 4. Spacing

Scală principală:
- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px

Excepțiile trebuie să aibă motiv vizual clar.

## 5. Tipografie

### Outfit
- titluri mari
- titluri secțiuni
- elemente de brand

### Inter
- text normal
- metadata
- butoane
- formulare
- navigație

### Space Grotesk
Folosit doar dacă există un rol special clar (statistici / numere / display).
Altfel se elimină treptat.

### Ierarhie
- Display: 40–56px desktop / 30–40px mobile
- Section title: 28–40px desktop / 22–30px mobile
- Card title: 16–20px
- Body: 14–16px
- Meta: 11–13px
- Micro label: 9–11px

## 6. Borders și glow

Trei intensități:
- subtle: 8–12% opacity
- active: 18–26%
- focus/premium: 35–45%

Glow-ul puternic se folosește doar pentru:
- focus
- score / rank
- CTA
- element premium

Nu toate elementele trebuie să lumineze simultan.

## 7. Shadows

- Card normal: shadow mic
- Hover: shadow mediu
- Popup: shadow mare
- Hero / premium: shadow special

Se evită shadow diferit pentru fiecare componentă.

## 8. Motion

Durate:
- micro: 120–160ms
- UI standard: 200–260ms
- card/popup: 320–450ms
- carousel: 600–650ms

Easing principal:
`cubic-bezier(.2,.8,.2,1)`

Animațiile decorative trebuie să fie lente și să nu concureze cu interacțiunea.

## 9. Breakpoints

### Mobile
360 / 390 / 430 px

### Tablet
768–1179 px

### Desktop compact
1180–1439 px

### Desktop standard
1440–1919 px

### Desktop wide
1920px+

Fiecare componentă trebuie verificată în toate aceste categorii.

## 10. Layout

- Max page width: 1920px
- Max visual content width: 1900px
- Grilă desktop principală: sidebar / content / sidebar
- Sub 1180px: layout pe o singură coloană sau structură adaptată, nu desktop micșorat forțat

Header-ul poate rămâne mai îngust ca element floating, dar spacing-ul intern trebuie aliniat cu restul sistemului.

## 11. Section pattern

Fiecare secțiune mare trebuie să aibă:
1. container clar
2. heading zone
3. content zone
4. spacing de intrare/ieșire consistent
5. border/surface din sistem
6. responsive behavior explicit

## 12. Card pattern

Toate cardurile trebuie să respecte:
- radius comun
- border comun
- title hierarchy comună
- metadata style comun
- hover/focus comun
- loading state
- touch state
- keyboard state

Cardurile pot avea variante, dar nu limbaje vizuale complet diferite.

## 13. Popup pattern

Popup standard:
- surface 3
- radius 24px
- border premium discret
- shadow mare
- heading sus
- metadata structurată
- CTA clar
- Escape = close
- click/tap în exterior = close unde este potrivit
- focus management
- aceeași animație de intrare/ieșire

## 14. Buttons

Tipuri:
- Primary
- Secondary
- Ghost
- Icon-only

Toate au stări:
- default
- hover
- active
- focus
- disabled

Touch target minim: 44x44px pentru mobil.

## 15. UX

- feedback vizual imediat după click/tap
- aceeași logică pentru close/back
- caruselele trebuie să fie swipe-friendly
- meniurile nu trebuie să se închidă accidental la touch
- acțiunile importante nu trebuie ascunse doar în hover
- pe mobil, hover-only este interzis

## 16. Accessibility

- contrast verificat
- focus vizibil
- navigare tastatură
- `aria-expanded` / `aria-hidden` corecte
- text alternativ imagini relevante
- `prefers-reduced-motion` respectat

## 17. Reguli pentru V12

1. Nu schimbăm identitatea AniVortex.
2. Nu schimbăm simultan toate secțiunile.
3. Lucrăm componentă cu componentă.
4. Fiecare componentă are preview înainte de merge.
5. Desktop și mobil se aprobă împreună.
6. V11 rămâne fallback live până la aprobarea V12.
7. După design final rulăm din nou LCP / CLS / Lighthouse / cross-browser.
