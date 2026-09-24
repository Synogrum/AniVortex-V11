/* Legacy code removed from production: DOM targets no longer exist. */
// Tabs (doar UI; logica de filtrare o pui tu)
document.querySelectorAll(".top-anime-widget .tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".top-anime-widget .tab").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    // Exemplu: aici poți face fetch / filtra lista în funcție de btn.dataset.range
  });
});

/* ================================
   Functia de schimbat cifra in plus
   (FIX: dropdown peste .view-video / peste orice stacking)
   ============================== */
(() => {
  const dropdown = document.getElementById('rankDropdown');
  if (!dropdown) return;

  const menu = dropdown.querySelector('.rank-menu');
  const ranks = document.querySelectorAll('.rank[data-rank]');
  if (!menu || !ranks.length) return;

  // ✅ IMPORTANT: scoate dropdown-ul din orice container (stacking context)
  // și pune-l direct în <body>, ca să poată sta peste .view-video / titluri etc.
  if (dropdown.parentElement !== document.body) {
    document.body.appendChild(dropdown);
  }

  // ✅ fortăm poziționarea ca overlay real
  dropdown.style.position = 'fixed';
  dropdown.style.zIndex = '2147483647'; // maxim practic (peste orice)
  dropdown.style.pointerEvents = 'none'; // devine activ doar când e deschis

  let activeRank = null;
  let closeTimer = null;

  function positionDropdown(rankEl) {
    const rect = rankEl.getBoundingClientRect();

    // Colțul din dreapta al ferestrei = jumătatea plusului
    dropdown.style.left = (rect.left + rect.width / 2 - 25) + 'px';
    dropdown.style.top  = (rect.top + rect.height / 2) + 'px';
    dropdown.style.transform = 'translate(-100%, 0)';
  }

  function openDropdown(rankEl) {
    activeRank = rankEl;
    positionDropdown(rankEl);

    dropdown.classList.add('is-open');
    dropdown.setAttribute('aria-hidden', 'false');

    // ✅ acum poate fi clicabil
    dropdown.style.pointerEvents = 'auto';
  }

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    dropdown.setAttribute('aria-hidden', 'true');
    activeRank = null;

    // ✅ nu mai prinde hover/click când e închis
    dropdown.style.pointerEvents = 'none';
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      closeDropdown();
    }, 120);
  }

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  // Hover pe fiecare rank (stabil)
  ranks.forEach(rank => {
    rank.addEventListener('mouseenter', () => {
      cancelClose();
      openDropdown(rank);
    });

    rank.addEventListener('mouseleave', () => {
      scheduleClose();
    });
  });

  // Hover pe dropdown (ține deschis)
  dropdown.addEventListener('mouseenter', () => {
    cancelClose();
  });

  dropdown.addEventListener('mouseleave', () => {
    scheduleClose();
  });

  // Click pe opțiune
  menu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || !activeRank) return;

    // status handled by data attribute

    closeDropdown();
  });

  // Repoziționează cel mult o dată pe frame în timpul scroll/resize.
  const scheduleDropdownPosition = (globalThis.AniVortexPerf?.rafThrottle || (callback => callback))(() => {
    if (activeRank) positionDropdown(activeRank);
  });

  globalThis.addEventListener('scroll', scheduleDropdownPosition, { capture: true, passive: true });
  globalThis.addEventListener('resize', scheduleDropdownPosition, { passive: true });
})();

