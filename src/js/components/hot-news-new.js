(() => {
  "use strict";

  const content = document.querySelector(".hot-news-section .hot-news-content");
  const source = window.AniVortexHotNewsData;
  if (!content || !source) return;

  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const truncateName = (value, maxLength = 20) => {
    const characters = Array.from(normalize(value));
    return characters.length > maxLength ? `${characters.slice(0, maxLength).join("")}...` : characters.join("");
  };

  const definitions = [
    { id: "anime", symbol: "☀", name: "Anime", note: "Episoade și serii noi", typeFallback: "TV", metaLabel: "EP." },
    { id: "manga", symbol: "☾", name: "Manga", note: "Capitole și volume noi", typeFallback: "MANGA", metaLabel: "CAP." },
    { id: "desene", symbol: "✦", name: "Desene", note: "Episoade dublate și subtitrate", typeFallback: "SERIES", metaLabel: "EP." }
  ].map((definition) => ({ ...definition, cards: Array.from(source[definition.id] || []) }));

  function popupMarkup(card, definition) {
    return `
      <aside class="hnv2-popup" aria-label="Detalii ${escapeHtml(card.title)}">
        <header class="hnv2-popup-head">
          <span>${escapeHtml(card.type)}</span>
          <div><small>${definition.name.toUpperCase()}</small><h4>${escapeHtml(card.title)}</h4></div>
          <b>${escapeHtml(card.rating)}</b>
        </header>
        <div class="hnv2-popup-content">
          <div class="hnv2-popup-facts"><span>${escapeHtml(card.posted)}</span><span>Status: ${escapeHtml(card.status)}</span></div>
          <p class="hnv2-popup-genres">${escapeHtml(card.genres)}</p>
          <div class="hnv2-popup-progress">
            <span><small>${definition.metaLabel}</small><b>${escapeHtml(card.number)}</b></span><i></i>
            <span><small>DURATĂ</small><b>${escapeHtml(card.duration)}</b></span>
          </div>
          <p class="hnv2-popup-description">${escapeHtml(card.description)}</p>
        </div>
        <footer class="hnv2-popup-actions"><button type="button">Vizionează acum</button><button type="button" aria-label="Adaugă în listă">+</button></footer>
      </aside>`;
  }

  function cardMarkup(card, definition, visualIndex, sourceIndex) {
    const seasonText = definition.id === "manga" ? "VOLUM NOU" : `SEZONUL ${(visualIndex % 3) + 1}`;
    return `
      <article class="hnv2-card" role="listitem" tabindex="0" aria-label="${escapeHtml(card.title)}" data-hnv2-category="${definition.id}" data-hnv2-source-index="${sourceIndex}">
        <div class="hnv2-visual"><img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" loading="lazy" decoding="async"></div>
        <div class="hnv2-card-body">
          <h3 title="${escapeHtml(card.title)}">${escapeHtml(truncateName(card.title))}</h3><small>${seasonText}</small>
          <div class="hnv2-status"><i aria-hidden="true"></i><strong>${escapeHtml(card.status)}</strong></div>
          <div class="hnv2-meta"><b class="hnv2-type">${escapeHtml(card.type)}</b><span aria-hidden="true"></span><b>${definition.metaLabel} ${escapeHtml(card.number)}</b><span aria-hidden="true"></span><b>${escapeHtml(card.duration)}</b></div>
        </div>
      </article>`;
  }

  function categoryMarkup(definition) {
    return `<section class="hnv2-category hnv2-category-${definition.id}" aria-labelledby="hnv2-${definition.id}-title">
      <header class="hnv2-category-head"><span class="hnv2-category-symbol hnv2-category-symbol-${definition.id}" aria-hidden="true">${definition.symbol}</span><div><h2 id="hnv2-${definition.id}-title">${definition.name}</h2><p>${definition.note}</p></div><i class="hnv2-category-rays" aria-hidden="true"></i><b>${definition.cards.length} TITLURI</b></header>
      <div class="hnv2-grid" role="list" data-hnv2-grid="${definition.id}"></div>
    </section>`;
  }

  const hotNewsShellMarkup = () => `<header class="hnv2-main-title"><span>PROASPĂT ADĂUGATE PE ANIVORTEX</span><h1>Noutăți fierbinți</h1></header><div class="hnv2-categories">${definitions.map(categoryMarkup).join("")}</div><nav class="hnv2-pagination" aria-label="Paginile noutăților"><button type="button" data-hnv2-direction="-1" aria-label="Pagina anterioară">‹</button>${[1,2,3,4,5].map((page)=>`<button type="button" data-hnv2-page="${page}" ${page===1?'class="is-active" aria-current="page"':""}>${page}</button>`).join("")}<button type="button" data-hnv2-direction="1" aria-label="Pagina următoare">›</button></nav>`;

  let activePage = 1;
  let hydrated = false;
  content.setAttribute("aria-busy", "true");
  let activePopupCard = null;

  function removePopup(card = activePopupCard) {
    if (!card) return;
    card.querySelector(":scope > .hnv2-popup")?.remove();
    if (activePopupCard === card) activePopupCard = null;
  }

  function ensurePopup(cardElement) {
    if (!cardElement || cardElement.querySelector(":scope > .hnv2-popup")) return;
    if (activePopupCard && activePopupCard !== cardElement) removePopup(activePopupCard);
    const definition = definitions.find((item) => item.id === cardElement.dataset.hnv2Category);
    const card = definition?.cards[Number(cardElement.dataset.hnv2SourceIndex)];
    if (!definition || !card) return;
    cardElement.insertAdjacentHTML("beforeend", popupMarkup(card, definition));
    activePopupCard = cardElement;
  }

  function renderPage(page) {
    removePopup();
    activePage = Math.min(5, Math.max(1, page));
    const startIndex = (activePage - 1) * 5;
    definitions.forEach((definition) => {
      const grid = content.querySelector(`[data-hnv2-grid="${definition.id}"]`);
      if (!grid || !definition.cards.length) return;
      grid.innerHTML = Array.from({length:15}, (_, offset) => {
        const sourceIndex = (startIndex + offset) % definition.cards.length;
        return cardMarkup(definition.cards[sourceIndex], definition, offset, sourceIndex);
      }).join("");
    });
    content.querySelectorAll("[data-hnv2-page]").forEach((button) => {
      const isActive = Number(button.dataset.hnv2Page) === activePage;
      button.classList.toggle("is-active", isActive);
      isActive ? button.setAttribute("aria-current","page") : button.removeAttribute("aria-current");
    });
  }

  content.addEventListener("pointerover", (event) => ensurePopup(event.target.closest(".hnv2-card")));
  content.addEventListener("focusin", (event) => ensurePopup(event.target.closest(".hnv2-card")));
  content.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".hnv2-card");
    if (!card || card.contains(event.relatedTarget) || card.contains(document.activeElement)) return;
    removePopup(card);
  });
  content.addEventListener("focusout", (event) => {
    const card = event.target.closest(".hnv2-card");
    if (!card) return;
    requestAnimationFrame(() => {
      if (!card.matches(":hover") && !card.contains(document.activeElement)) removePopup(card);
    });
  });

  content.addEventListener("click", (event) => {
    const button = event.target.closest(".hnv2-pagination button");
    if (!button) return;
    if (button.dataset.hnv2Page) return renderPage(Number(button.dataset.hnv2Page));
    if (button.dataset.hnv2Direction) renderPage(activePage + Number(button.dataset.hnv2Direction));
  });

  function hydrateHotNews() {
    if (hydrated) return;
    hydrated = true;
    content.innerHTML = hotNewsShellMarkup();
    content.setAttribute("aria-busy", "false");
    renderPage(1);
    requestAnimationFrame(scheduleHotNewsAlignment);
  }

  function scheduleLazyHydration() {
    const section = content.closest(".hot-news-section");
    if (!section || typeof IntersectionObserver !== "function") {
      hydrateHotNews();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      hydrateHotNews();
    }, { rootMargin: "900px 0px", threshold: 0 });
    observer.observe(section);
  }

  function alignHotNewsWithNewsFooter() {
    const hotSection = document.querySelector(".hot-news-section");
    const newsPanel = document.querySelector(".av-news-panel");
    if (!hotSection || !newsPanel) return;
    const sectionTop = hotSection.getBoundingClientRect().top + window.scrollY;
    const newsBottomLine = newsPanel.getBoundingClientRect().bottom + window.scrollY - 55;
    const desiredSectionHeight = Math.ceil(newsBottomLine - sectionTop);
    if (desiredSectionHeight > 0) {
      hotSection.style.height = `${desiredSectionHeight}px`;
      hotSection.style.minHeight = `${desiredSectionHeight}px`;
    }
  }
  const scheduleHotNewsAlignment = (window.AniVortexPerf?.rafThrottle || ((callback) => callback))(alignHotNewsWithNewsFooter);
  window.addEventListener("load", scheduleHotNewsAlignment, { once: true });
  window.addEventListener("resize", scheduleHotNewsAlignment, { passive: true });
  scheduleHotNewsAlignment();
  scheduleLazyHydration();
})();
