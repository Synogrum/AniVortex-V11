function safeStorageGet(key) {
  try { return globalThis.localStorage?.getItem(key) ?? null; }
  catch (_) { return null; }
}

function safeStorageSet(key, value) {
  try { globalThis.localStorage?.setItem(key, value); return true; }
  catch (_) { return false; }
}

/* ===== SERIILE VOASTRE FAVORITE — LOGICĂ ROBUSTĂ V19 ===== */
(() => {
  "use strict";

  function initFavoritePanelV19() {
    const panel = document.querySelector(".serii-favorite-refresh");
    const list = document.getElementById("favoriteTopList");
    const popup = document.getElementById("favoriteStatusPopup");
    const categoryName = document.getElementById("favCategoryName");
    const previousCategory = document.getElementById("favPrevCategory");
    const nextCategory = document.getElementById("favNextCategory");

    if (!panel || !list || !popup || !categoryName || !previousCategory || !nextCategory) {
      return;
    }

    if (panel.dataset.favoriteV19Ready === "true") {
      return;
    }
    panel.dataset.favoriteV19Ready = "true";

    const categories = [
      "Anime",
      "Manga",
      "Desene",
      "Live-action",
      "Filme/Seriale",
      "Cărți"
    ];
    const statusClasses = [
      "status-watching",
      "status-completed",
      "status-waiting",
      "status-dropped",
      "status-planned"
    ];

    const cards = Array.from(list.querySelectorAll(".fav-card"));
    const visibleCards = 5;
    const carouselInterval = 20000;

    panel.querySelectorAll(".fav-action").forEach((button) => {
      button.setAttribute("aria-controls", popup.id);
      button.setAttribute("aria-haspopup", "menu");
      button.setAttribute("aria-expanded", "false");
    });

    let categoryIndex = 0;
    let firstVisibleIndex = 0;
    let activeAction = null;
    let popupCloseTimer = null;

    function updateCategory(direction) {
      categoryIndex = (categoryIndex + direction + categories.length) % categories.length;
      categoryName.textContent = categories[categoryIndex];
    }

    previousCategory.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      updateCategory(-1);
    });

    nextCategory.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      updateCategory(1);
    });

    panel.querySelectorAll(".fav-periods button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        panel.querySelectorAll(".fav-periods button").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
      });
    });

    function renderCards() {
      cards.forEach((card, index) => {
        const visible =
          index >= firstVisibleIndex &&
          index < firstVisibleIndex + visibleCards;

        card.classList.toggle("is-hidden", !visible);
        card.classList.remove("is-leaving");
      });
    }

    function getMenuItems() {
      return Array.from(popup.querySelectorAll('[role="menuitem"]'));
    }

    function focusMenuItem(index) {
      const items = getMenuItems();
      if (!items.length) return;
      const safeIndex = (index + items.length) % items.length;
      items[safeIndex].focus({ preventScroll: true });
    }

    function clearPopupInlineState() {
      popup.style.opacity = "";
      popup.style.visibility = "";
      popup.style.pointerEvents = "";
    }

    function closePopup({ restoreFocus = false } = {}) {
      globalThis.clearTimeout(popupCloseTimer);

      const trigger = activeAction;
      popup.classList.remove("is-open", "is-right");
      popup.setAttribute("aria-hidden", "true");
      clearPopupInlineState();

      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }

      activeAction = null;
      if (restoreFocus) trigger?.focus({ preventScroll: true });
    }

    function positionPopup(button) {
      const result = window.AniVortexPopup.placeAdjacent(popup, button, {
        prefer: "left",
        fallback: "right",
        gap: 10,
        safe: 8,
        topOffset: -11,
        width: popup.offsetWidth || 174,
        height: popup.offsetHeight || 205,
      });
      popup.classList.toggle("is-right", result?.side === "right");
    }

    function openPopup(button, { focusMenu = false } = {}) {
      globalThis.clearTimeout(popupCloseTimer);

      if (activeAction && activeAction !== button) {
        activeAction.setAttribute("aria-expanded", "false");
      }

      activeAction = button;
      button.setAttribute("aria-expanded", "true");

      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");

      /* Fallback vizual, inclusiv când alte reguli CSS de pe site au prioritate. */
      popup.style.opacity = "1";
      popup.style.visibility = "visible";
      popup.style.pointerEvents = "auto";

      positionPopup(button);
      if (focusMenu) {
        focusMenuItem(0);
      }
    }

    function togglePopup(button, options = {}) {
      const isSameOpenButton =
        activeAction === button &&
        popup.classList.contains("is-open");

      if (isSameOpenButton) {
        closePopup();
      } else {
        openPopup(button, options);
      }
    }

    function applySelectedStatus(option) {
      if (!activeAction) return;

      const status = option.dataset.status;
      const label = option.textContent.trim();
      const selectedButton = activeAction;

      selectedButton.classList.remove(...statusClasses);
      selectedButton.classList.add("is-added", `status-${status}`);
      selectedButton.dataset.status = status;
      selectedButton.textContent = "✓";
      selectedButton.title = label;
      selectedButton.setAttribute(
        "aria-label",
        `Stare selectată: ${label}`
      );

      closePopup({ restoreFocus: true });
    }

    function schedulePopupClose(delay = 260) {
      globalThis.clearTimeout(popupCloseTimer);

      popupCloseTimer = globalThis.setTimeout(() => {
        const buttonHovered =
          activeAction &&
          typeof activeAction.matches === "function" &&
          activeAction.matches(":hover");

        if (popup.matches(":hover") || buttonHovered) {
          return;
        }

        closePopup();
      }, delay);
    }

    panel.addEventListener("keydown", (event) => {
      const actionButton = event.target.closest?.(".fav-action");
      if (!actionButton || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      event.stopPropagation();
      togglePopup(actionButton, { focusMenu: true });
    }, true);

    /*
      Ascultător global în faza capture.
      Astfel butonul funcționează chiar dacă alte scripturi ale paginii
      opresc click-ul în faza bubble.
    */
    document.addEventListener(
      "click",
      (event) => {
        const option = event.target.closest(
          "#favoriteStatusPopup [data-status]"
        );

        if (option) {
          event.preventDefault();
          event.stopPropagation();
          applySelectedStatus(option);
          return;
        }

        const actionButton = event.target.closest(
          ".serii-favorite-refresh .fav-action"
        );

        if (actionButton) {
          event.preventDefault();
          event.stopPropagation();
          togglePopup(actionButton, { focusMenu: event.detail === 0 });
          return;
        }

        if (!popup.contains(event.target)) {
          closePopup();
        }
      },
      true
    );

    panel.addEventListener(
      "pointerover",
      (event) => {
        if (event.target.closest(".fav-action")) {
          globalThis.clearTimeout(popupCloseTimer);
        }
      },
      true
    );

    panel.addEventListener(
      "pointerout",
      (event) => {
        if (
          event.target.closest(".fav-action") &&
          popup.classList.contains("is-open")
        ) {
          schedulePopupClose(360);
        }
      },
      true
    );

    popup.addEventListener("mouseenter", () => {
      globalThis.clearTimeout(popupCloseTimer);
    });

    popup.addEventListener("mouseleave", () => {
      schedulePopupClose(190);
    });

    popup.addEventListener("keydown", (event) => {
      const items = getMenuItems();
      if (!items.length) return;
      const currentIndex = items.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusMenuItem(currentIndex < 0 ? 0 : currentIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusMenuItem(currentIndex < 0 ? items.length - 1 : currentIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusMenuItem(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusMenuItem(items.length - 1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closePopup({ restoreFocus: true });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && popup.classList.contains("is-open")) {
        event.preventDefault();
        closePopup({ restoreFocus: true });
      }
    });

    const favoritePopupTracking = window.AniVortexPopup.bindViewportTracking(() => {
      if (activeAction) positionPopup(activeAction);
    });
    const scheduleFavoritePopupPosition = favoritePopupTracking.schedule;

    function advanceCards() {
      if (cards.length <= visibleCards) return;

      closePopup();

      const maxStart = cards.length - visibleCards;
      const outgoing = cards[firstVisibleIndex];
      outgoing?.classList.add("is-leaving");

      globalThis.setTimeout(() => {
        firstVisibleIndex =
          firstVisibleIndex >= maxStart
            ? 0
            : firstVisibleIndex + 1;

        renderCards();
      }, 240);
    }

    const carouselController = window.AniVortexCarousel.createAutoplayController({
      root: panel,
      interval: carouselInterval,
      tick: advanceCards,
      canStart: () => !panel.matches(":hover") && !panel.contains(document.activeElement),
    });

    function startCarousel() {
      carouselController.start();
    }

    const stopCarousel = () => carouselController.stop();
    window.AniVortexCarousel.bindInteractionPause(panel, carouselController);

    renderCards();
    startCarousel();
  }

  /*
    Blocul este pus la începutul main.js.
    Chiar dacă un alt modul al paginii produce o eroare ulterior,
    inițializarea acestui panou rămâne deja programată.
  */
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initFavoritePanelV19,
      { once: true }
    );
  } else {
    initFavoritePanelV19();
  }
})();
/* ===== SFÂRȘIT SERIILE VOASTRE FAVORITE — LOGICĂ ROBUSTĂ V19 ===== */

