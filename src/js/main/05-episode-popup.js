/* ==========================================
   Popup episoade: hover, touch și tastatură
   ========================================== */
(() => {
  "use strict";

  const CARD_SELECTOR =
    ".anime-wrap .a-card, .manga-wrap .a-card-manga, .desene-wrap .a-card";
  const TOGGLE_CLASS = "episode-popup-toggle";
  let activeCard = null;
  let suppressFocusOpen = false;

  function getPopup(card) {
    return card?.querySelector(":scope > .anime-popup, :scope > .manga-popup") || null;
  }

  function getToggle(card) {
    return card?.querySelector(`:scope > .${TOGGLE_CLASS}`) || null;
  }

  function createPopupIcon(iconClass) {
    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function getCardCategory(card) {
    if (card.closest(".manga-wrap")) return "Manga";
    if (card.closest(".desene-wrap")) return "Desene";
    return "Anime";
  }

  function getMetaValue(element) {
    const rawText = (element?.textContent || "").replace(/\s+/g, " ").trim();
    const separatorIndex = rawText.indexOf(":");
    return separatorIndex >= 0
      ? rawText.slice(separatorIndex + 1).trim()
      : rawText;
  }

  function enhanceMetaField(element, label, iconClass) {
    if (!element || element.querySelector(".popup-meta-value")) return;

    let value = getMetaValue(element);

    if (label === "Status" && /^in traducere$/i.test(value)) {
      value = "În traducere";
    }

    const labelElement = document.createElement("span");
    labelElement.className = "popup-meta-label";
    labelElement.append(
      createPopupIcon(iconClass),
      document.createTextNode(label)
    );

    const valueElement = document.createElement("span");
    valueElement.className = "popup-meta-value";
    valueElement.textContent = value;

    element.replaceChildren(labelElement, valueElement);
  }

  function enhancePlainMetaField(element, label) {
    if (!element || element.querySelector(".popup-meta-value")) return;

    let value = getMetaValue(element);
    if (label === "Status" && /^in traducere$/i.test(value)) {
      value = "În traducere";
    } else if (label === "Status" && /^complete$/i.test(value)) {
      value = "Complet";
    } else if (label === "Status" && /^on-?going$/i.test(value)) {
      value = "În desfășurare";
    }

    const labelElement = document.createElement("span");
    labelElement.className = "popup-meta-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("span");
    valueElement.className = "popup-meta-value";
    valueElement.textContent = value;

    element.replaceChildren(labelElement, valueElement);
  }

  function getEpisodeDuration(card) {
    const cardMeta = card.querySelector(".a-pill")?.textContent || "";
    return cardMeta.match(/\d+(?:[.,]\d+)?\s*(?:min|h)\b/i)?.[0] || "";
  }

  function enhancePopupRating(popup) {
    const rating = popup.querySelector(".popup-rating");
    if (!rating || rating.querySelector(".popup-rating-value")) return;

    const value = (rating.textContent || "").match(/\d+(?:[.,]\d+)?/)?.[0] || "—";
    const valueElement = document.createElement("span");
    valueElement.className = "popup-rating-value";
    valueElement.textContent = value;
    rating.setAttribute("aria-label", `Rating ${value} din 10`);
    rating.replaceChildren(
      createPopupIcon("fa-solid fa-star"),
      valueElement
    );
  }

  function enhanceEpisodeMetrics(card, popup) {
    const metrics = Array.from(popup.querySelectorAll(".popup-ep"));
    if (!metrics.length || metrics.some(metric => metric.querySelector(".popup-ep-label"))) {
      return;
    }

    const isManga = card.matches(".a-card-manga");
    const duration = isManga ? "" : getEpisodeDuration(card);
    const labels = isManga
      ? ["Capitol", "Total"]
      : ["Episod", duration ? "Durată" : "Total"];
    const icons = isManga
      ? ["fa-solid fa-book-open", "fa-solid fa-layer-group"]
      : ["fa-solid fa-layer-group", duration ? "fa-regular fa-clock" : "fa-solid fa-layer-group"];

    const metricsContainer = popup.querySelector(".popup-episodes");
    metricsContainer?.setAttribute("role", "group");
    metricsContainer?.setAttribute("aria-label", "Informații episod");

    metrics.forEach((metric, index) => {
      const valueElement = Array.from(metric.children).find(
        child => child.tagName === "SPAN"
      );
      if (!valueElement) return;

      metric.querySelector(".popup-ep-icon")?.remove();

      const labelElement = document.createElement("span");
      labelElement.className = "popup-ep-label";
      labelElement.textContent = labels[index] || "Total";

      valueElement.classList.add("popup-ep-value");
      if (index === 1 && duration) {
        valueElement.textContent = duration;
      }

      metric.prepend(labelElement, createPopupIcon(icons[index] || icons[0]));
    });
  }

  function enhancePremiumEpisodeMetrics(card, popup) {
    const metrics = Array.from(popup.querySelectorAll(".popup-ep"));
    if (metrics.length < 2) return;

    const isManga = card.matches(".a-card-manga");

    metrics.forEach((metric, index) => {
      const valueElement = Array.from(metric.children).find(
        child => child.tagName === "SPAN"
      );
      if (!valueElement) return;

      metric.querySelectorAll("img, i, .popup-ep-label").forEach(node => node.remove());

      const numericValue = (valueElement.textContent || "").match(/\d+/)?.[0] || "1";
      const labelElement = document.createElement("span");
      labelElement.className = "popup-ep-label";
      labelElement.textContent = index === 0
        ? (isManga ? "Capitol" : "Episod")
        : "din";

      valueElement.classList.add("popup-ep-value");
      valueElement.textContent = numericValue.padStart(2, "0");
      metric.prepend(labelElement);
    });

    const metricsContainer = popup.querySelector(".popup-episodes");
    metricsContainer?.setAttribute("role", "group");
    metricsContainer?.setAttribute(
      "aria-label",
      isManga ? "Capitol disponibil" : "Episod disponibil"
    );

    const content = popup.querySelector(".popup-content");
    if (content && !content.querySelector(".popup-duration")) {
      const duration = document.createElement("div");
      duration.className = "popup-duration popup-side-fact";

      const durationLabel = document.createElement("span");
      durationLabel.className = "popup-meta-label";
      durationLabel.textContent = isManga ? "Volum" : "Durată";

      const durationValue = document.createElement("span");
      durationValue.className = "popup-meta-value";
      durationValue.textContent = isManga
        ? (popup.querySelector(".popup-vol")?.textContent.trim() || "Manga")
        : (getEpisodeDuration(card) || "—");

      duration.append(durationLabel, durationValue);
      content.insertBefore(duration, metricsContainer);
    }
  }

  function enhancePopupActions(popup, title) {
    const watchButton = popup.querySelector(".watch-btn");
    const addButton = popup.querySelector(".add-btn");

    if (watchButton && !watchButton.querySelector(".popup-action-label")) {
      const watchLabel = document.createElement("span");
      watchLabel.className = "popup-action-label";
      watchLabel.textContent = "Vizionează acum";
      watchButton.type = "button";
      watchButton.replaceChildren(
        createPopupIcon("fa-solid fa-play"),
        watchLabel
      );
    }

    if (addButton && !addButton.querySelector(".popup-action-label")) {
      const addLabel = document.createElement("span");
      addLabel.className = "popup-action-label";
      addLabel.textContent = "Adaugă";
      addButton.type = "button";
      addButton.setAttribute("aria-pressed", "false");
      addButton.setAttribute("aria-label", `Adaugă ${title} în lista personală`);
      addButton.replaceChildren(
        createPopupIcon("fa-solid fa-plus"),
        addLabel
      );
    }
  }

  function enhancePremiumPopupContent(card, popup, title) {
    popup.style.removeProperty("--episode-popup-art");

    const header = popup.querySelector(".popup-header");
    if (header && !header.querySelector(".popup-taxonomy")) {
      const category = document.createElement("span");
      category.className = "popup-category";
      category.textContent = getCardCategory(card);

      const taxonomy = document.createElement("div");
      taxonomy.className = "popup-taxonomy";
      const type = header.querySelector(".popup-tv, .popup-vol");
      taxonomy.append(category);
      if (type) taxonomy.append(type);
      header.prepend(taxonomy);
    }

    const posted = popup.querySelector(".popup-posted");
    const status = popup.querySelector(".popup-status");
    const genres = popup.querySelector(".popup-genres");
    enhancePlainMetaField(posted, "Postat");
    enhancePlainMetaField(status, "Status");
    enhancePlainMetaField(genres, "Genuri");

    enhancePopupRating(popup);
    enhancePremiumEpisodeMetrics(card, popup);

    const content = popup.querySelector(".popup-content");
    if (content && !content.querySelector(".popup-story")) {
      const description = content.querySelector(".popup-desc");
      if (description) {
        const story = document.createElement("div");
        story.className = "popup-story";

        const storyLabel = document.createElement("span");
        storyLabel.className = "popup-description-label";
        storyLabel.textContent = "Descrierea seriei";

        story.append(storyLabel, description);
        content.append(story);
      }
    }

    if (content && !content.querySelector(".popup-meta-strip") && posted && status) {
      const metaStrip = document.createElement("div");
      metaStrip.className = "popup-meta-strip";
      metaStrip.setAttribute("aria-label", "Metadate serie");
      metaStrip.append(posted, status);
      content.append(metaStrip);
    }

    enhancePopupActions(popup, title);
    popup.dataset.episodeDesignReady = "true";
  }

  function enhancePopupContent(card, popup, title) {
    // Clasa designului aprobat este garantată înaintea oricărei ieșiri rapide.
    popup.classList.add("av-series-popup");
    if (popup.dataset.episodeDesignReady === "true") return;
    enhancePremiumPopupContent(card, popup, title);
  }

  function updatePopupPlacement(card) {
    const popup = getPopup(card);
    if (!popup?.classList.contains("av-series-popup")) return;

    popup.classList.remove("is-popup-left");
    if (globalThis.innerWidth <= 1100) return;

    const popupWidth = popup.getBoundingClientRect().width ||
      Math.min(440, Math.max(360, globalThis.innerWidth * 0.32));
    const side = window.AniVortexPopup.chooseSide(card, popup, {
      prefer: "right",
      gap: 16,
      safe: 0,
      width: popupWidth,
    });
    popup.classList.toggle("is-popup-left", side === "left");
  }

  function setPopupState(card, isOpen) {
    const popup = getPopup(card);
    const toggle = getToggle(card);
    if (!popup || !toggle) return;

    card.classList.toggle("is-popup-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    popup.setAttribute("aria-hidden", String(!isOpen));
    popup.inert = !isOpen;

    if (isOpen) {
      updatePopupPlacement(card);
      if (activeCard && activeCard !== card) {
        activeCard.dataset.popupPinned = "false";
        setPopupState(activeCard, false);
      }
      activeCard = card;
    } else if (activeCard === card) {
      activeCard = null;
    }
  }

  function closePopup(card, restoreFocus = false) {
    if (!card) return;
    card.dataset.popupPinned = "false";
    setPopupState(card, false);

    if (restoreFocus) {
      suppressFocusOpen = true;
      getToggle(card)?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        suppressFocusOpen = false;
      });
    }
  }

  function initEpisodePopups() {
    document.querySelectorAll(CARD_SELECTOR).forEach((card, index) => {
      const popup = getPopup(card);
      if (!popup) return;

      const title =
        popup.querySelector(".popup-title .jp")?.dataset.fullText ||
        popup.querySelector(".popup-title .jp")?.textContent?.trim() ||
        card.querySelector(".a-vertical")?.dataset.full ||
        card.querySelector(".a-vertical")?.textContent?.trim() ||
        "această serie";

      enhancePopupContent(card, popup, title);
      if (getToggle(card)) return;

      popup.id ||= `episode-popup-${index + 1}`;
      popup.setAttribute("role", "region");
      popup.setAttribute("aria-label", `Detalii pentru ${title}`);
      popup.setAttribute("aria-hidden", "true");
      popup.inert = true;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = TOGGLE_CLASS;
      toggle.setAttribute("aria-label", `Vezi detalii pentru ${title}`);
      toggle.setAttribute("aria-controls", popup.id);
      toggle.setAttribute("aria-expanded", "false");

      card.dataset.popupPinned = "false";
      card.insertBefore(toggle, popup);
    });
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(CARD_SELECTOR);
    const relatedTarget = event.relatedTarget;
    if (!card || (relatedTarget instanceof Node && card.contains(relatedTarget))) return;
    setPopupState(card, true);
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(CARD_SELECTOR);
    const relatedTarget = event.relatedTarget;
    if (!card || (relatedTarget instanceof Node && card.contains(relatedTarget))) return;
    if (card.dataset.popupPinned === "true" || card.contains(document.activeElement)) return;
    setPopupState(card, false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || !(event.target instanceof Element)) return;
    const toggle = event.target.closest(`.${TOGGLE_CLASS}`);
    const card = toggle?.closest(CARD_SELECTOR);
    if (!card) return;

    card.dataset.popupPinned = "true";
    setPopupState(card, true);
  });

  document.addEventListener("focusin", (event) => {
    if (suppressFocusOpen) return;
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(CARD_SELECTOR);
    if (card) setPopupState(card, true);
  });

  document.addEventListener("focusout", (event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(CARD_SELECTOR);
    if (!card) return;

    requestAnimationFrame(() => {
      if (card.dataset.popupPinned !== "true" && !card.contains(document.activeElement)) {
        setPopupState(card, false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const addButton = event.target.closest(
      ".anime-popup .add-btn, .manga-popup .add-btn"
    );
    if (addButton) {
      const isAdded = addButton.getAttribute("aria-pressed") === "true";
      const label = addButton.querySelector(".popup-action-label");
      const icon = addButton.querySelector("i");
      const card = addButton.closest(CARD_SELECTOR);
      const title =
        card?.querySelector(".popup-title .jp")?.dataset.fullText ||
        card?.querySelector(".popup-title .jp")?.textContent?.trim() ||
        "seria";

      addButton.classList.toggle("is-added", !isAdded);
      addButton.setAttribute("aria-pressed", String(!isAdded));
      addButton.setAttribute(
        "aria-label",
        isAdded
          ? `Adaugă ${title} în lista personală`
          : `Elimină ${title} din lista personală`
      );

      if (label) {
        label.textContent = isAdded ? "Adaugă" : "Adăugat";
      }
      if (icon) {
        icon.className = isAdded ? "fa-solid fa-plus" : "fa-solid fa-check";
      }
      return;
    }

    const toggle = event.target.closest(`.${TOGGLE_CLASS}`);
    if (toggle) {
      const card = toggle.closest(CARD_SELECTOR);
      if (!card) return;
      if (event.detail > 0 && card.dataset.popupPinned === "true") return;

      const willPin = card.dataset.popupPinned !== "true";
      card.dataset.popupPinned = String(willPin);
      setPopupState(card, willPin);
      return;
    }

    if (activeCard && !activeCard.contains(event.target)) {
      closePopup(activeCard);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !activeCard) return;
    event.preventDefault();
    closePopup(activeCard, true);
  });

  const episodePopupTracking = window.AniVortexPopup.bindViewportTracking(() => {
    if (activeCard) updatePopupPlacement(activeCard);
  }, { scroll: false });
  const scheduleEpisodePopupPosition = episodePopupTracking.schedule;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEpisodePopups);
  } else {
    initEpisodePopups();
  }
})();

/* =========================================================
   Hot News V2: designul aprobat pentru .hnv2-popup
   ========================================================= */
(() => {
  "use strict";

  const content = document.querySelector(".hot-news-section .hot-news-content");
  if (!content) return;

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const withoutLabel = (value, label) => String(value || "")
    .replace(new RegExp(`^${label}\\s*:?\\s*`, "i"), "")
    .trim();

  function createFact(className, label, value) {
    const fact = createElement("div", className);
    fact.append(
      createElement("span", "hnv2-approved-label", label),
      createElement("strong", "hnv2-approved-value", value || "—")
    );
    return fact;
  }

  function expandDescription(value, title, category, genres, status) {
    const description = String(value || "").replace(/\s+/g, " ").trim();
    const cleanCategory = String(category || "serie").trim().toLowerCase();
    const cleanGenres = String(genres || "").replace(/\s+/g, " ").trim();
    const cleanStatus = String(status || "").replace(/\s+/g, " ").trim();
    const factualDetails = cleanGenres
      ? `Este o producție ${cleanCategory} care combină elemente de ${cleanGenres}${cleanStatus ? ` și este disponibilă cu statusul ${cleanStatus}` : ""}.`
      : `Este o producție ${cleanCategory}${cleanStatus ? ` disponibilă cu statusul ${cleanStatus}` : ""}.`;

    return `${description} ${factualDetails}`.trim();
  }

  function limitDescriptionWords(value, maximumWords = 60) {
    const words = String(value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    if (!words.length) return "";

    const finalWords = words.slice(0, maximumWords);
    finalWords[finalWords.length - 1] = finalWords[finalWords.length - 1].replace(/[.,;:!?]+$/, "");
    return `${finalWords.join(" ")}...`;
  }

  function enhanceHotNewsPopup(popup) {
    if (!(popup instanceof HTMLElement) || popup.dataset.approvedDesign === "true") return;

    const head = popup.querySelector(":scope > .hnv2-popup-head");
    const body = popup.querySelector(":scope > .hnv2-popup-content");
    const actions = popup.querySelector(":scope > .hnv2-popup-actions");
    if (!head || !body || !actions) return;

    const type = head.querySelector(":scope > span")?.textContent.trim() || "TV";
    const category = head.querySelector("small")?.textContent.trim() || "ANIME";
    const title = head.querySelector("h4")?.textContent.trim() || "Serie";
    const rating = (head.querySelector(":scope > b")?.textContent || "")
      .replace(/[^0-9.,]/g, "") || "—";

    const factItems = body.querySelectorAll(".hnv2-popup-facts > span");
    const posted = withoutLabel(factItems[0]?.textContent, "Postat");
    const status = withoutLabel(factItems[1]?.textContent, "Status");
    const genres = withoutLabel(
      withoutLabel(body.querySelector(".hnv2-popup-genres")?.textContent, "Genuri"),
      "Genres"
    );
    const progressItems = body.querySelectorAll(".hnv2-popup-progress > span");
    const episode = progressItems[0]?.querySelector("b")?.textContent.trim() || "1";
    const duration = progressItems[1]?.querySelector("b")?.textContent.trim() || "—";
    const description = body.querySelector(".hnv2-popup-description")?.textContent.trim() ||
      "Descoperă povestea și cele mai noi informații despre această serie pe AniVortex.";

    const taxonomy = createElement("div", "hnv2-approved-taxonomy");
    taxonomy.append(
      createElement("span", "hnv2-approved-category", category),
      createElement("i", "hnv2-approved-taxonomy-line"),
      createElement("span", "hnv2-approved-type", type)
    );

    const titleElement = createElement("h4", "hnv2-approved-title", title);
    titleElement.title = title;

    const ratingElement = createElement("div", "hnv2-approved-rating");
    ratingElement.setAttribute("aria-label", `Rating ${rating} din 10`);
    const ratingIcon = createElement("i", "fa-solid fa-star");
    ratingIcon.setAttribute("aria-hidden", "true");
    ratingElement.append(ratingIcon, createElement("strong", "", rating));
    head.replaceChildren(taxonomy, titleElement, ratingElement);

    const durationFact = createFact(
      "hnv2-approved-side-fact hnv2-approved-duration",
      "Durată",
      duration
    );
    const qualityFact = createFact(
      "hnv2-approved-side-fact hnv2-approved-quality",
      "Calitate",
      "FULL HD"
    );

    const episodePanel = createElement("div", "hnv2-approved-episode");
    episodePanel.setAttribute("aria-label", `Episodul ${episode}`);
    episodePanel.append(
      createElement("span", "hnv2-approved-label", "Episodul"),
      createElement("strong", "hnv2-approved-episode-number", episode.padStart(2, "0")),
      createElement("small", "", `DIN ${episode.padStart(2, "0")}`)
    );

    const story = createElement("div", "hnv2-approved-story");
    const descriptionElement = createElement("p", "hnv2-popup-description");
    descriptionElement.textContent = limitDescriptionWords(
      expandDescription(description, title, category, genres, status)
    ).replace(/,\s+/g, ",\u00A0");
    story.append(
      createElement("span", "hnv2-approved-label", "Descrierea seriei"),
      descriptionElement
    );

    const metaStrip = createElement("div", "hnv2-approved-meta-strip");
    metaStrip.setAttribute("aria-label", "Metadate serie");
    metaStrip.append(
      createFact("hnv2-approved-meta", "Postat", posted),
      createFact("hnv2-approved-meta hnv2-approved-status", "Status", status)
    );

    body.replaceChildren(durationFact, episodePanel, qualityFact, story, metaStrip);

    const watchButton = actions.querySelector("button:first-child");
    const addButton = actions.querySelector("button:last-child");
    if (watchButton) {
      const playIcon = createElement("i", "fa-solid fa-play");
      playIcon.setAttribute("aria-hidden", "true");
      watchButton.replaceChildren(playIcon, createElement("span", "", "Vizionează acum"));
    }
    if (addButton) {
      const addIcon = createElement("i", "fa-solid fa-plus");
      addIcon.setAttribute("aria-hidden", "true");
      addButton.replaceChildren(addIcon);
      addButton.setAttribute("aria-label", `Adaugă ${title} în listă`);
    }

    popup.classList.add("av-hnv2-approved");
    popup.dataset.approvedDesign = "true";
    popup.setAttribute("role", "region");
    popup.setAttribute("aria-hidden", "true");
    popup.inert = true;

    const card = popup.closest(".hnv2-card");
    card?.setAttribute("aria-expanded", "false");
  }

  const enhanceAll = (root = content) => {
    if (root instanceof Element && root.matches(".hnv2-popup")) {
      enhanceHotNewsPopup(root);
    }
    root.querySelectorAll?.(".hnv2-popup").forEach(enhanceHotNewsPopup);
  };

  const setCardPopupState = (card, open) => {
    const popup = card?.querySelector(":scope > .hnv2-popup");
    if (!popup) return;
    const cardRect = card.getBoundingClientRect();
    popup.style.setProperty("--hnv2-popup-width", `${Math.round(cardRect.width + 64)}px`);
    popup.style.setProperty("--hnv2-card-height", `${Math.round(cardRect.height)}px`);
    card.setAttribute("aria-expanded", String(open));
    popup.setAttribute("aria-hidden", String(!open));
    popup.inert = !open;
  };

  enhanceAll();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) enhanceAll(node);
      });
    });
  });
  observer.observe(content, { childList: true, subtree: true });

  content.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
    const card = event.target.closest(".hnv2-card");
    if (card && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) {
      setCardPopupState(card, true);
    }
  });

  content.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
    const card = event.target.closest(".hnv2-card");
    if (card && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) {
      if (!card.contains(document.activeElement)) setCardPopupState(card, false);
    }
  });

  content.addEventListener("focusin", (event) => {
    if (event.target instanceof Element) setCardPopupState(event.target.closest(".hnv2-card"), true);
  });

  content.addEventListener("focusout", (event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(".hnv2-card");
    requestAnimationFrame(() => {
      if (card && !card.contains(document.activeElement)) setCardPopupState(card, false);
    });
  });

  content.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !(event.target instanceof Element)) return;
    const card = event.target.closest(".hnv2-card");
    if (!card) return;
    event.preventDefault();
    setCardPopupState(card, false);
    if (document.activeElement instanceof HTMLElement && card.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });
})();

// Funcție COMUNĂ pentru afișarea unei pagini de carduri (eliminare duplicare)
function showCardsPage(page, nav) {
  const { allCards, cardsPerPage, totalPages, leftArrow, rightArrow, dots } = nav;
  // Ascundem toate cardurile
  allCards.forEach(card => {
    card.style.display = 'none';
  });
  
  // Afișăm cardurile din pagina curentă
  const startIndex = page * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, allCards.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    allCards[i].style.display = 'flex';
  }
  
  // Actualizăm butoanele și dots
  if (page === 0) {
    leftArrow.classList.add('disabled');
    leftArrow.disabled = true;
  } else {
    leftArrow.classList.remove('disabled');
    leftArrow.disabled = false;
  }
  
  if (page === totalPages - 1) {
    rightArrow.classList.add('disabled');
    rightArrow.disabled = true;
  } else {
    rightArrow.classList.remove('disabled');
    rightArrow.disabled = false;
  }
  
  dots.forEach((dot, index) => {
    if (index < totalPages) {
      dot.style.display = 'inline-block';
      if (index === page) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    } else {
      dot.style.display = 'none';
    }
  });
}

// Funcție COMUNĂ pentru atașarea evenimentelor de navigare
function setupNavigationEvents(nav, pageState) {
  const { leftArrow, rightArrow, dots, totalPages } = nav;
  const { getPage, setPage } = pageState;

  leftArrow.addEventListener('click', function() {
    const currentPage = getPage();
    if (currentPage > 0) {
      setPage(currentPage - 1);
      showCardsPage(currentPage - 1, nav);
    }
  });
  
  rightArrow.addEventListener('click', function() {
    const currentPage = getPage();
    if (currentPage < totalPages - 1) {
      setPage(currentPage + 1);
      showCardsPage(currentPage + 1, nav);
    }
  });
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      if (index < totalPages) {
        setPage(index);
        showCardsPage(index, nav);
      }
    });
  });
  
  showCardsPage(0, nav);
}

// Funcție pentru inițializarea navigației DESENE
function initDeseneNavigation() {
  // Găsim secțiunea Desene
  const deseneHeader = document.querySelector('.desene-header');
  if (!deseneHeader) {
    return;
  }
  
  // Găsim controalele care vin IMEDIAT după header
  const deseneControls = deseneHeader.querySelector('.desene-controls');
  if (!deseneControls) {
    return;
  }
  
  // Găsim elementele din interiorul .desene-controls
  const leftArrow = deseneControls.querySelector('.desene-arrow.left');
  const rightArrow = deseneControls.querySelector('.desene-arrow.right');
  const dots = deseneControls.querySelectorAll('.desene-dots span');
  const deseneWrap = document.querySelector('.desene-wrap');
  
  if (!leftArrow || !rightArrow || !dots.length || !deseneWrap) {
    return;
  }
  
  const allCards = document.querySelectorAll('.desene-wrap .a-card');
  const cardsPerPage = 15;
  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  let currentPage = 0;
  
  setupNavigationEvents(
    { leftArrow, rightArrow, dots, totalPages, allCards, cardsPerPage },
    { getPage: () => currentPage, setPage: (p) => { currentPage = p; } }
  );
}

// Funcție pentru inițializarea navigației MANGA
function initMangaNavigation() {
  // Găsim titlul Manga
  const mangaTitle = document.querySelector('.manga-tt-clasa');
  if (!mangaTitle) {
    return;
  }
  
  // Găsim controalele care vin IMEDIAT după titlu
  const mangaControls = mangaTitle.nextElementSibling;
  if (!mangaControls?.classList.contains('desene-controls')) {
    return;
  }
  
  // Găsim elementele din interiorul controalelor
  const leftArrow = mangaControls.querySelector('.desene-arrow.left');
  const rightArrow = mangaControls.querySelector('.desene-arrow.right');
  const dots = mangaControls.querySelectorAll('.desene-dots span');
  const mangaWrap = document.querySelector('.manga-wrap');
  
  if (!leftArrow || !rightArrow || !dots.length || !mangaWrap) {
    return;
  }
  
  const allCards = document.querySelectorAll('.manga-wrap .a-card-manga');
  const cardsPerPage = 15;
  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  let currentPage = 0;
  
  setupNavigationEvents(
    { leftArrow, rightArrow, dots, totalPages, allCards, cardsPerPage },
    { getPage: () => currentPage, setPage: (p) => { currentPage = p; } }
  );
}

