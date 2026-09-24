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

// ======================== WIDGET-URI ACTIVE ========================

// Functie cufar
function openChestReward() {
  document.getElementById("popup-chest-closed").style.display = "none";
  document.getElementById("popup-chest-opened").style.display = "block";
  document.getElementById("reward-message").style.display = "block";
  document.getElementById("reward-image").style.display = "block";

  // Salvează timpul deschiderii pentru a nu afișa iar popup-ul în 24h
  safeStorageSet("lastChestOpen", String(Date.now()));

  // După 10 secunde, ascunde popup-ul automat
  setTimeout(() => {
    document.getElementById("chest-popup").style.display = "none";
  }, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
  const lastOpen = safeStorageGet("lastChestOpen");
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 ore în milisecunde

  // Afișează popup-ul doar dacă nu a fost deschis în ultimele 24h
  if (!lastOpen || (now - lastOpen) >= oneDay) {
    document.getElementById("chest-popup").style.display = "flex";
    
    // Resetare starea popup la închidere
    document.getElementById("popup-chest-closed").style.display = "block";
    document.getElementById("popup-chest-opened").style.display = "none";
    document.getElementById("reward-message").style.display = "none";
    document.getElementById("reward-image").style.display = "none";
  } else {
    document.getElementById("chest-popup").style.display = "none";
  }
});

// Funcție Surprinde-mă — varianta UI/UX nouă
(() => {
  const surpriseSeries = [
    {
      nume: "Blue Dragon",
      traducator: "SynoGrum",
      img: "public/imgs/suprinde-ma/Blue Dragon.webp",
      link: "public/serii/blue-dragon.html",
      genuri: ["Aventură", "Fantezie"]
    },
    {
      nume: "Ayakashi Triangle",
      traducator: "Anne",
      img: "public/imgs/suprinde-ma/Ayakashi Triangle.webp",
      link: "public/serii/ayakashi-triangle.html",
      genuri: ["Comedie", "Romance"]
    }
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("surpriseCard");
    const imagine = document.getElementById("imgSerie");
    const nume = document.getElementById("numeSerie");
    const traducator = document.getElementById("traducatorSerie");
    const linkImagine = document.getElementById("linkSerie");
    const linkButon = document.getElementById("butonLink");
    const tags = document.querySelector(".suprinde-ma .surprise-tags");
    const butoaneShuffle = [
      document.getElementById("shuffleTop"),
      document.getElementById("shuffleSerie")
    ].filter(Boolean);

    if (!card || !imagine || !nume || !traducator || !linkImagine || !linkButon || !tags) {
      return;
    }

    let surpriseIndex = 0;

    function aplicaSerie(serie) {
      nume.textContent = serie.nume;
      traducator.textContent = `Tradus de ${serie.traducator}`;
      imagine.src = serie.img;
      imagine.alt = serie.nume;
      linkImagine.href = serie.link;
      linkButon.href = serie.link;
      tags.innerHTML = serie.genuri
        .map(gen => `<span>${gen}</span>`)
        .join("");
    }

    function schimbaSeria() {
      surpriseIndex = (surpriseIndex + 1) % surpriseSeries.length;

      card.classList.remove("is-changing");
      void card.offsetWidth;
      card.classList.add("is-changing");

      globalThis.setTimeout(() => {
        aplicaSerie(surpriseSeries[surpriseIndex]);
      }, 180);
    }

    butoaneShuffle.forEach(buton => {
      buton.addEventListener("click", schimbaSeria);
    });

    // Ca în varianta veche: click pe imagine afișează următoarea serie.
    // Linkul „Vezi seria” rămâne singurul care deschide pagina seriei.
    linkImagine.addEventListener("click", (event) => {
      event.preventDefault();
      schimbaSeria();
    });

    card.addEventListener("animationend", () => {
      card.classList.remove("is-changing");
    });

    aplicaSerie(surpriseSeries[0]);
  });
})();

// Program săptămânal — varianta UI/UX nouă
globalThis.addEventListener("DOMContentLoaded", () => {
  const programe = {
    luni: [],
    marti: [],
    miercuri: [],
    joi: [],
    vineri: [],
    sambata: [],
    duminica: [
      { titlu: "Attack on Titan", episod: 5, ora: "10:00" },
      { titlu: "Jujutsu Kaisen", episod: 10, ora: "10:30" },
      { titlu: "Blue Lock", episod: 14, ora: "11:00" },
      { titlu: "Demon Slayer", episod: 8, ora: "11:30" },
      { titlu: "Solo Leveling", episod: 12, ora: "12:00" },
      { titlu: "One Piece", episod: 1134, ora: "12:30" },
      { titlu: "Bleach", episod: 27, ora: "13:00" },
      { titlu: "My Hero Academia", episod: 9, ora: "13:30" },
      { titlu: "Kaiju No. 8", episod: 6, ora: "14:00" },
      { titlu: "Wind Breaker", episod: 11, ora: "14:30" },
      { titlu: "Black Clover", episod: 171, ora: "15:00" },
      { titlu: "Fire Force", episod: 18, ora: "15:30" },
      { titlu: "Dr. Stone", episod: 20, ora: "16:00" },
      { titlu: "Chainsaw Man", episod: 13, ora: "16:30" },
      { titlu: "Spy x Family", episod: 26, ora: "17:00" }
    ]
  };

  const zileOrdine = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];
  const zileNume = {
    luni: "Luni",
    marti: "Marți",
    miercuri: "Miercuri",
    joi: "Joi",
    vineri: "Vineri",
    sambata: "Sâmbătă",
    duminica: "Duminică"
  };

  const listaTitluri = document.getElementById("listaTitluri");
  const dataCurenta = document.getElementById("dataCurenta");
  const ziSelectata = document.getElementById("ziSelectata");
  const programCount = document.getElementById("programCount");
  const programAfisat = document.getElementById("programAfisat");
  const fereastraProgram = document.querySelector(".serii-programate");
  const zileButoane = document.getElementById("zileButoane");
  const containerZile = document.querySelector(".serii-programate .zile-butoane-container");
  const toggleDisclaimer = document.getElementById("toggleDisclaimer");
  const disclaimerText = document.getElementById("disclaimerText");

  if (!zileButoane || !listaTitluri || !dataCurenta || !ziSelectata || !programCount || !containerZile) {
    return;
  }

  function getBucharestDate() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
  }

  function getSelectedDate(zi) {
    const azi = getBucharestDate();
    const indexAzi = (azi.getDay() + 6) % 7; // luni = 0
    const indexSelectat = zileOrdine.indexOf(zi);
    const data = new Date(azi);
    data.setDate(azi.getDate() + indexSelectat - indexAzi);
    return data;
  }

  function formatDate(data) {
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(data);
  }

  function pluralEpisoade(numar) {
    return `${numar} ${numar === 1 ? "episod" : "episoade"}`;
  }

  function actualizeazaButoane(ziActiva) {
    zileButoane.querySelectorAll("button[data-zi]").forEach(buton => {
      const esteActiv = buton.dataset.zi === ziActiva;
      buton.classList.toggle("is-active", esteActiv);
      buton.setAttribute("aria-selected", String(esteActiv));
      buton.tabIndex = esteActiv ? 0 : -1;
    });
  }

  function afiseazaProgram(zi) {
    const programari = programe[zi] || [];

    actualizeazaButoane(zi);
    ziSelectata.textContent = zileNume[zi];
    dataCurenta.textContent = formatDate(getSelectedDate(zi));
    dataCurenta.setAttribute("datetime", getSelectedDate(zi).toISOString().slice(0, 10));
    programCount.textContent = pluralEpisoade(programari.length);

    const esteGol = programari.length === 0;
    programAfisat?.classList.toggle("is-empty", esteGol);
    programAfisat?.classList.toggle("has-program", !esteGol);
    fereastraProgram?.classList.toggle("is-empty", esteGol);
    fereastraProgram?.classList.toggle("has-program", !esteGol);

    if (!programari.length) {
      const azi = getBucharestDate();
      const indexAzi = (azi.getDay() + 6) % 7;
      const ziAzi = zileOrdine[indexAzi];
      const etichetaZi = zi === ziAzi ? "azi" : zileNume[zi];

      listaTitluri.innerHTML = `
        <div class="program-empty">
          <i class="fa-regular fa-calendar-xmark" aria-hidden="true"></i>
          <strong>Nu este nimic programat pentru ${etichetaZi}</strong>
          <span>Revino mai târziu. Programul poate fi actualizat pe parcursul zilei.</span>
        </div>
      `;
      return;
    }

    listaTitluri.innerHTML = programari.map((program, index) => `
      <article class="program-item">
        <span class="program-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="program-info">
          <div class="program-title" title="${program.titlu}">${program.titlu}</div>
          <span class="program-episode">Episodul ${program.episod}</span>
        </div>
        <time class="program-time" datetime="${program.ora}">${program.ora}</time>
      </article>
    `).join("");
  }

  function gasesteZiInitiala() {
    const azi = getBucharestDate();
    const indexAzi = (azi.getDay() + 6) % 7;
    return zileOrdine[indexAzi];
  }

  function centreazaButonul(buton, behavior = "smooth") {
    if (!buton) return;
    const left = buton.offsetLeft - (containerZile.clientWidth - buton.offsetWidth) / 2;
    containerZile.scrollTo({ left: Math.max(0, left), behavior });
  }

  const butoaneZile = [...zileButoane.querySelectorAll("button[data-zi]")];

  // Listener direct pe fiecare zi. Astfel, scroll-ul orizontal nu mai poate bloca apăsarea.
  butoaneZile.forEach(buton => {
    buton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const zi = buton.dataset.zi;
      if (!zi) return;

      afiseazaProgram(zi);
      centreazaButonul(buton);
    });
  });

  zileButoane.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const indexActiv = butoaneZile.findIndex(buton => buton.getAttribute("aria-selected") === "true");
    const directie = event.key === "ArrowRight" ? 1 : -1;
    const indexNou = (indexActiv + directie + butoaneZile.length) % butoaneZile.length;
    butoaneZile[indexNou].click();
    butoaneZile[indexNou].focus();
  });

  // Păstrăm scroll-ul nativ pe touch. Pe desktop, rotița mută zilele stânga-dreapta.
  // Nu mai folosim pointer capture / drag pe întregul container, fiindcă acesta putea anula click-ul.
  containerZile.addEventListener("wheel", event => {
    const deplasare = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    if (!deplasare) return;
    event.preventDefault();
    containerZile.scrollLeft += deplasare;
  }, { passive: false });

  if (toggleDisclaimer && disclaimerText) {
    toggleDisclaimer.addEventListener("click", () => {
      const deschis = toggleDisclaimer.getAttribute("aria-expanded") === "true";
      toggleDisclaimer.setAttribute("aria-expanded", String(!deschis));
      disclaimerText.hidden = deschis;
    });
  }

  const ziInitiala = gasesteZiInitiala();
  afiseazaProgram(ziInitiala);

  const butonInitial = zileButoane.querySelector(`[data-zi="${ziInitiala}"]`);
  const centreazaZiuaInitiala = () => centreazaButonul(butonInitial, "auto");

  // Centrarea se face numai când widgetul se apropie de viewport.
  // Callback-ul IntersectionObserver vine după layout, deci offset/clientWidth nu mai
  // forțează calculul întregii pagini în timpul încărcării inițiale.
  const centreazaCandDevineVizibil = () => requestAnimationFrame(centreazaZiuaInitiala);

  if (typeof globalThis.IntersectionObserver === "function" && fereastraProgram) {
    const observerProgram = new IntersectionObserver((entries, observer) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      centreazaCandDevineVizibil();
    }, { rootMargin: "320px 0px", threshold: 0.01 });
    observerProgram.observe(fereastraProgram);
  } else {
    globalThis.setTimeout(centreazaCandDevineVizibil, 900);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const seriiLista = [
    {
      nume: "My Hero Academia Final Season",
      episod: "Ep. 12",
      tip: "SUB",
      ora: "acum 8 min",
      imagine: "public/imgs/serii favorite/top anime/1.v1.1.jpg",
      link: "link-read.html"
    },
    {
      nume: "Digimon Beatbreak",
      episod: "Ep. 17",
      tip: "SUB",
      ora: "acum 24 min",
      imagine: "public/imgs/serii favorite/top anime/1.v1.2.jpg",
      link: "link-read.html"
    },
    {
      nume: "Kingdom Season 6",
      episod: "Ep. 08",
      tip: "SUB",
      ora: "acum 46 min",
      imagine: "public/imgs/serii favorite/top anime/1.v1.3.jpg",
      link: "link-read.html"
    },
    {
      nume: "Ninja vs. Gokudo",
      episod: "Ep. 10",
      tip: "DUB",
      ora: "acum 1 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.4.jpg",
      link: "link-read.html"
    },
    {
      nume: "Tojima Wants to Be a Kamen Rider",
      episod: "Ep. 06",
      tip: "SUB",
      ora: "acum 2 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.5.jpg",
      link: "link-read.html"
    },
    {
      nume: "Dad is a Hero, Mom is a Spirit",
      episod: "Ep. 09", tip: "SUB", ora: "acum 3 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.6.jpg", link: "link-read.html"
    },
    {
      nume: "Uma Musume: Cinderella Gray Part 2",
      episod: "Ep. 11", tip: "SUB", ora: "acum 4 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.7.jpg", link: "link-read.html"
    },
    {
      nume: "My Gift Lvl 9999 Unlimited Gacha",
      episod: "Ep. 07", tip: "DUB", ora: "acum 5 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.8.jpg", link: "link-read.html"
    },
    {
      nume: "Sanda",
      episod: "Ep. 10", tip: "SUB", ora: "acum 6 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.9.jpg", link: "link-read.html"
    },
    {
      nume: "One-Punch Man Season 3",
      episod: "Ep. 12", tip: "SUB", ora: "acum 7 h",
      imagine: "public/imgs/serii favorite/top anime/1.v1.10.jpg", link: "link-read.html"
    },
    {
      nume: "Solo Leveling Season 2",
      episod: "Ep. 13", tip: "DUB", ora: "acum 8 h",
      imagine: "public/imgs/serii favorite/poze anime/11.jpg", link: "link-read.html"
    },
    {
      nume: "Dragon Ball Daima S2",
      episod: "Ep. 05", tip: "SUB", ora: "acum 9 h",
      imagine: "public/imgs/serii favorite/poze anime/12.jpg", link: "link-read.html"
    },
    {
      nume: "Blue Lock",
      episod: "Ep. 18", tip: "SUB", ora: "acum 10 h",
      imagine: "public/imgs/serii favorite/poze anime/13.jpg", link: "link-read.html"
    },
    {
      nume: "Demon Slayer",
      episod: "Ep. 08", tip: "DUB", ora: "ieri",
      imagine: "public/imgs/serii favorite/poze anime/14.jpg", link: "link-read.html"
    },
    {
      nume: "Jujutsu Kaisen",
      episod: "Ep. 24", tip: "SUB", ora: "ieri",
      imagine: "public/imgs/serii favorite/poze anime/15.jpg", link: "link-read.html"
    },
    {
      nume: "One Piece",
      episod: "Ep. 1150", tip: "SUB", ora: "ieri",
      imagine: "public/imgs/serii favorite/poze anime/16.jpg", link: "link-read.html"
    },
    {
      nume: "Attack on Titan",
      episod: "Ep. 75", tip: "DUB", ora: "ieri",
      imagine: "public/imgs/serii favorite/poze anime/17.jpg", link: "link-read.html"
    },
    {
      nume: "Bleach: Thousand-Year Blood War",
      episod: "Ep. 14", tip: "SUB", ora: "ieri",
      imagine: "public/imgs/serii favorite/poze anime/18.jpg", link: "link-read.html"
    },
    {
      nume: "Chainsaw Man",
      episod: "Ep. 12", tip: "DUB", ora: "acum 2 zile",
      imagine: "public/imgs/serii favorite/poze anime/19.jpg", link: "link-read.html"
    },
    {
      nume: "Spy x Family",
      episod: "Ep. 25", tip: "SUB", ora: "acum 2 zile",
      imagine: "public/imgs/serii favorite/poze anime/20.jpg", link: "link-read.html"
    },
    {
      nume: "Kaiju No. 8",
      episod: "Ep. 12", tip: "SUB", ora: "acum 2 zile",
      imagine: "public/imgs/serii favorite/poze anime/21.jpg", link: "link-read.html"
    },
    {
      nume: "Dan Da Dan",
      episod: "Ep. 09", tip: "DUB", ora: "acum 3 zile",
      imagine: "public/imgs/serii favorite/poze anime/22.jpg", link: "link-read.html"
    },
    {
      nume: "Frieren: Beyond Journey's End",
      episod: "Ep. 28", tip: "SUB", ora: "acum 3 zile",
      imagine: "public/imgs/serii favorite/poze anime/23.jpg", link: "link-read.html"
    },
    {
      nume: "The Apothecary Diaries",
      episod: "Ep. 24", tip: "SUB", ora: "acum 4 zile",
      imagine: "public/imgs/serii favorite/poze anime/24.jpg", link: "link-read.html"
    },
    {
      nume: "Hell's Paradise",
      episod: "Ep. 13", tip: "DUB", ora: "acum 4 zile",
      imagine: "public/imgs/serii favorite/poze anime/25.jpg", link: "link-read.html"
    }
  ];

  const container = document.querySelector(".serii-lista");
  if (!container) return;

  container.innerHTML = "";

  seriiLista.forEach((serie, index) => {
    const articol = document.createElement("article");
    articol.className = `recent-post${index === 0 ? " recent-post-featured" : ""}`;

    articol.innerHTML = `
      <a class="recent-post-poster" href="${serie.link}" aria-label="Deschide ${serie.nume}">
        <img src="${serie.imagine}" alt="Poster ${serie.nume}" loading="lazy" decoding="async">
        ${index === 0 ? '<span aria-hidden="true">NOU</span>' : ""}
      </a>
      <div class="recent-post-copy">
        <a class="recent-post-title" href="${serie.link}" title="${serie.nume}">${serie.nume}</a>
        <div class="recent-post-details">
          <span class="recent-post-episode">Episodul ${Number(serie.episod.replace(/\D/g, ""))}</span>
          <i class="recent-post-separator" aria-hidden="true"></i>
          <time>postat ${serie.ora}</time>
        </div>
      </div>
    `;

    container.appendChild(articol);
  });
});

// Titlurile știrilor sunt echilibrate nativ din CSS (text-wrap: balance).
/* ==========================================
   Functie de crapat titlul la cartonase
   (Anime + Manga + Desene) + Vol badge pe 2 randuri
   + Vol badge in POPUP (Manga) pe 2 randuri
   + Popup badge special (ex: Special/Movie/Short) pe 2 randuri
   ========================================== */
(() => {
  const MAX_COL_CHARS = 26;
  const MAX_COLS = 2;
  const ELLIPSIS = "…";

  // pentru badge-uri din popup (Special/Movie/etc.)
  const BADGE_MAX_CHARS = 8; // daca e mai lung, il spargem
  const BADGE_MAX_COLS = 2;

  function normalizeText(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function buildColumn(words, maxChars) {
    let col = "";
    while (words.length) {
      const w = words[0];
      const next = col ? col + " " + w : w;
      if (next.length > maxChars) break;
      col = next;
      words.shift();
    }
    return col;
  }

  function truncateToFit(text, maxChars) {
    const t = normalizeText(text);
    if (t.length <= maxChars) return t;

    const limit = Math.max(0, maxChars - ELLIPSIS.length);
    let cut = t.slice(0, limit).trimEnd();

    const lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > 0) cut = cut.slice(0, lastSpace).trimEnd();

    return cut + ELLIPSIS;
  }

  function formatVerticalTitle(raw) {
    const text = normalizeText(raw);
    if (!text) return "";

    if (text.length <= MAX_COL_CHARS) return text;

    const words = text.split(" ");

    const col1 = buildColumn(words, MAX_COL_CHARS);
    if (!col1) return truncateToFit(text, MAX_COL_CHARS);
    if (MAX_COLS === 1) return truncateToFit(col1, MAX_COL_CHARS);

    const col2 = buildColumn(words, MAX_COL_CHARS);

    if (words.length) {
      const remaining = (col2 ? col2 + " " : "") + words.join(" ");
      const fixedCol2 = truncateToFit(remaining, MAX_COL_CHARS);
      return col1 + "\n" + fixedCol2;
    }

    if (!col2) {
      const rest = words.join(" ");
      return col1 + "\n" + truncateToFit(rest, MAX_COL_CHARS);
    }

    return col1 + "\n" + col2;
  }

  // sparge textul in 2 randuri pt badge-uri (Special/Movie/etc.)
  function formatBadgeText(raw, maxChars = BADGE_MAX_CHARS, maxCols = BADGE_MAX_COLS) {
    const text = normalizeText(raw);
    if (!text) return "";

    if (text.length <= maxChars) return text;

    // daca e un singur cuvant lung (Supernatural), il taiem in 2 bucati
    const words = text.split(" ");
    if (words.length === 1) {
      const mid = Math.ceil(text.length / 2);
      const a = text.slice(0, mid).trim();
      const b = text.slice(mid).trim();
      return (a || text) + "\n" + (b || "");
    }

    const w = [...words];
    const col1 = buildColumn(w, maxChars) || truncateToFit(text, maxChars);

    if (maxCols === 1) return truncateToFit(col1, maxChars);

    const col2 = buildColumn(w, maxChars);

    if (w.length) {
      const remaining = (col2 ? col2 + " " : "") + w.join(" ");
      const fixedCol2 = truncateToFit(remaining, maxChars);
      return col1 + "\n" + fixedCol2;
    }

    if (!col2) return col1;
    return col1 + "\n" + col2;
  }

  /* ==========================
     APPLY: TITLURI VERTICALE (Anime + Manga + Desene)
     ========================== */
  function applyTitles() {
    document
      .querySelectorAll(
        ".anime-wrap .a-side .a-vertical, .manga-wrap .a-side .a-vertical, .desene-wrap .a-side .a-vertical"
      )
      .forEach((el) => {
        el.style.whiteSpace = "pre-line";

        const original = el.dataset.full || el.textContent;
        const clean = normalizeText(original);

        el.dataset.full = clean;
        el.textContent = formatVerticalTitle(clean);
      });
  }

  /* ==========================
     FORMAT helper: VOL -> Vol.<span class="vol-no">X</span>
     ========================== */
  function formatVolBadge(badge) {
    if (!badge) return;
    if (badge.querySelector(".vol-no")) return; // deja formatat

    const raw = normalizeText(badge.textContent);

    // prinde: "Vol. 1", "Vol.1", "VOL 12", "Volume 43", "VOL.1000"
    const m = raw.match(/^(vol\.?|volume)\s*\.?\s*(\d+)\s*$/i);
    if (!m) return;

    const num = m[2];

    const full = badge.dataset.full;
    badge.innerHTML = `Vol.<span class="vol-no">${num}</span>`;
    if (full) badge.dataset.full = full;
  }

  /* ==========================
     APPLY: MANGA VOL BADGE (pe card)
     ========================== */
  function applyVolBadges() {
    document
      .querySelectorAll(".manga-wrap .a-card-manga .a-side .bad.manga")
      .forEach(formatVolBadge);
  }

  /* ==========================
     APPLY: MANGA VOL BADGE (în popup)
     ========================== */
  function applyPopupVolBadges() {
    document
      .querySelectorAll(".manga-wrap .manga-popup .popup-vol")
      .forEach(formatVolBadge);
  }

  /* ==========================
     APPLY: POPUP SPECIAL BADGE (Special/Movie/Short/etc.)
     ========================== */
  function applyPopupSpecialBadges() {
    document
      .querySelectorAll(
        ".anime-wrap .anime-popup .popup-tv.popup-special, " +
        ".manga-wrap .manga-popup .popup-tv.popup-special, " +
        ".desene-wrap .anime-popup .popup-tv.popup-special"
      )
      .forEach((el) => {
        // pastram textul original
        if (!el.dataset.fullText) el.dataset.fullText = normalizeText(el.textContent);

        el.style.whiteSpace = "pre-line";
        el.style.textAlign = "center";
        el.textContent = formatBadgeText(el.dataset.fullText, BADGE_MAX_CHARS, BADGE_MAX_COLS);
        el.title = el.dataset.fullText;
      });
  }

  function applyAll() {
    applyTitles();
    applyVolBadges();
    applyPopupVolBadges();
    applyPopupSpecialBadges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll);
  } else {
    applyAll();
  }
})();

/* ==========================================
   Caprare descriere popup 
   ========================================== */
function clampPopupText(el, maxLines = 5){
  const style = globalThis.getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight);
  const maxHeight = lineHeight * maxLines;

  if (el.scrollHeight <= maxHeight) return;

  let text = el.textContent.trim();
  let words = text.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i++){
    result += words[i] + " ";
    el.textContent = result + "...";

    if (el.scrollHeight > maxHeight){
      el.textContent = result.trim().slice(0, -words[i].length) + "...";
      break;
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".popup-desc").forEach(desc => {
    const isSeriesPopup = Boolean(
      desc.closest(".anime-wrap, .manga-wrap, .desene-wrap")
    );
    if (!isSeriesPopup) clampPopupText(desc, 2);
  });
});

/* ==========================================
   Titluri responsive în popupurile episoadelor
   ========================================== */
(() => {
  "use strict";

  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();

  function allowResponsiveTitle(el) {
    el.style.removeProperty("display");
    el.style.removeProperty("white-space");
    el.style.removeProperty("overflow");
    el.style.removeProperty("text-overflow");
    el.style.removeProperty("max-width");
  }

  function applyToPopup(popup) {
    if (!popup) return;

    const jp = popup.querySelector(".popup-title .jp");
    const en = popup.querySelector(".popup-title .en");
    if (!jp || !en) return;

    // păstrează textul original o singură dată (ca să nu tot scurtezi scurtatul)
    if (!jp.dataset.fullText) jp.dataset.fullText = normalize(jp.textContent);
    if (!en.dataset.fullText) en.dataset.fullText = normalize(en.textContent);

    allowResponsiveTitle(jp);
    allowResponsiveTitle(en);

    jp.textContent = jp.dataset.fullText;
    en.textContent = en.dataset.fullText;

    jp.title = jp.dataset.fullText;
    en.title = en.dataset.fullText;
  }

  function apply(card) {
    if (!card) return;

    // ✅ anime popup (anime + desene, fiindcă desenele folosesc tot .anime-popup)
    const animePopup = card.querySelector(".anime-popup");
    if (animePopup) applyToPopup(animePopup);

    // ✅ manga popup
    const mangaPopup = card.querySelector(".manga-popup");
    if (mangaPopup) applyToPopup(mangaPopup);
  }

  function handler(e) {
    if (!(e.target instanceof Element)) return;

    // ✅ prinde: anime card, manga card, desene card
    const card =
      e.target.closest(".anime-wrap .a-card") ||
      e.target.closest(".manga-wrap .a-card-manga") ||
      e.target.closest(".desene-wrap .a-card");

    if (!card) return;
    apply(card);
  }

  // ✅ punem ambele, ca să eliminăm cazurile în care mouseenter nu prinde din cauza overlay/transform
  document.addEventListener("mouseenter", handler, true);
  document.addEventListener("mouseover", handler, true);
})();

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

// Funcție pentru inițializarea navigației ANIME
function initAnimeNavigation() {
  // Găsim titlul Anime
  const animeTitle = document.querySelector('.anime-tt-clasa');
  if (!animeTitle) {
    return;
  }
  
  // Găsim controalele care vin IMEDIAT după titlu
  const animeControls = animeTitle.nextElementSibling;
  if (!animeControls?.classList.contains('desene-controls')) {
    return;
  }
  
  // Găsim elementele din interiorul controalelor
  const leftArrow = animeControls.querySelector('.desene-arrow.left');
  const rightArrow = animeControls.querySelector('.desene-arrow.right');
  const dots = animeControls.querySelectorAll('.desene-dots span');
  const animeWrap = document.querySelector('.anime-wrap');
  
  if (!leftArrow || !rightArrow || !dots.length || !animeWrap) {
    return;
  }
  
  const allCards = document.querySelectorAll('.anime-wrap .a-card');
  const cardsPerPage = 15;
  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  let currentPage = 0;
  
  setupNavigationEvents(
    { leftArrow, rightArrow, dots, totalPages, allCards, cardsPerPage },
    { getPage: () => currentPage, setPage: (p) => { currentPage = p; } }
  );
}

// Pornim funcțiile când pagina s-a încărcat complet
document.addEventListener('DOMContentLoaded', function() {
  initDeseneNavigation();
  initMangaNavigation();
  initAnimeNavigation();
});

// ======================== TOP SUGESTII — REFRESH FINAL ========================
document.addEventListener('DOMContentLoaded', function () {
  const panel = document.getElementById('topSuggestionsPanel');
  const feature = document.getElementById('tsFeature');
  const list = document.getElementById('tsList');
  const categoryLabel = document.getElementById('tsCatLabel');
  const previousCategoryButton = document.getElementById('tsCatPrev');
  const nextCategoryButton = document.getElementById('tsCatNext');

  if (!panel || !feature || !list || !categoryLabel || !previousCategoryButton || !nextCategoryButton) {
    return;
  }

  const suggestions = [
    {
      rank: 1,
      title: 'Solo Leveling Season 3',
      user: 'AnimeCrisul',
      likes: 342,
      dislikes: 128,
      image: 'public/imgs/serii favorite/top anime/1.v1.1.jpg'
    },
    {
      rank: 2,
      title: 'Chainsaw Man S2',
      user: 'VasyDE',
      likes: 287,
      dislikes: 95,
      image: 'public/imgs/serii favorite/top anime/1.v1.2.jpg'
    },
    {
      rank: 3,
      title: 'Vinland Saga S3',
      user: 'Nenea19',
      likes: 245,
      dislikes: 82,
      image: 'public/imgs/serii favorite/top anime/1.v1.3.jpg'
    },
    {
      rank: 4,
      title: 'Bleach TYBW Part 4',
      user: 'stres',
      likes: 198,
      dislikes: 67,
      image: 'public/imgs/serii favorite/top anime/1.v1.4.jpg'
    },
    {
      rank: 5,
      title: 'Berserk 2026',
      user: 'SiNNED14',
      likes: 156,
      dislikes: 54,
      image: 'public/imgs/serii favorite/top anime/1.v1.5.jpg'
    },
    {
      rank: 6,
      title: 'Jujutsu Kaisen S3',
      user: 'Laurentio8',
      likes: 134,
      dislikes: 45,
      image: 'public/imgs/serii favorite/top anime/1.v1.6.jpg'
    },
    {
      rank: 7,
      title: 'One Piece Gear 6',
      user: 'DarkX',
      likes: 112,
      dislikes: 38,
      image: 'public/imgs/serii favorite/top anime/1.v1.7.jpg'
    },
    {
      rank: 8,
      title: 'Spy x Family Season 3',
      user: 'OtakuRo',
      likes: 98,
      dislikes: 32,
      image: 'public/imgs/serii favorite/top anime/1.v1.8.jpg'
    },
    {
      rank: 9,
      title: 'Dragon Ball Daima S2',
      user: 'MangaFan',
      likes: 87,
      dislikes: 28,
      image: 'public/imgs/serii favorite/top anime/1.v1.9.jpg'
    },
    {
      rank: 10,
      title: 'Demon Slayer Season 5',
      user: 'AnimeKid',
      likes: 76,
      dislikes: 21,
      image: 'public/imgs/serii favorite/top anime/1.v1.10.jpg'
    }
  ];

  const categories = [
    'Anime',
    'Manga',
    'Desene',
    'Live-action',
    'Filme/Seriale',
    'Cărți'
  ];

  const rotationInterval = 7000;
  const transitionDelay = 220;
  let activeIndex = 0;
  let categoryIndex = 0;
  let renderTimer = null;

  function rankClass(rank) {
    return rank >= 1 && rank <= 3 ? `rank-${rank}` : 'rank-standard';
  }

  function rankLabel(rank) {
    return `#${rank}`;
  }

  function createFeatureMarkup(item) {
    return `
      <div class="ts-feature-poster">
        <span class="ts-rank ${rankClass(item.rank)}">${rankLabel(item.rank)}</span>
        <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      </div>

      <div class="ts-feature-info">
        <div class="ts-place">Locul ${item.rank}</div>
        <div class="ts-serie">${item.title}</div>
        <div class="ts-user">propus de <strong>${item.user}</strong></div>

        <div class="ts-score-row" aria-label="Voturile sugestiei">
          <span class="ts-score upvote" title="Voturi pozitive">
            <span class="ts-vote-triangle is-up" aria-hidden="true"></span>
            ${item.likes}
          </span>
          <span class="ts-score downvote" title="Voturi negative">
            <span class="ts-vote-triangle is-down" aria-hidden="true"></span>
            ${item.dislikes}
          </span>
        </div>

        <button class="ts-view" type="button">Vezi sugestia</button>
      </div>
    `;
  }

  function createRowMarkup(item, index) {
    return `
      <article
        class="ts-row"
        data-index="${index}"
        role="button"
        tabindex="0"
        aria-label="Afișează locul ${item.rank}: ${item.title}"
      >
        <div class="ts-mini-poster">
          <span class="ts-rank ${rankClass(item.rank)}">${rankLabel(item.rank)}</span>
          <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
        </div>

        <div class="ts-row-info">
          <div class="ts-row-title">${item.title}</div>
          <div class="ts-row-user">propus de <strong>${item.user}</strong></div>
          <div class="ts-row-scores" aria-label="Voturile sugestiei">
            <span class="upvote" title="Voturi pozitive">
              <span class="ts-vote-triangle is-up" aria-hidden="true"></span>
              ${item.likes}
            </span>
            <span class="downvote" title="Voturi negative">
              <span class="ts-vote-triangle is-down" aria-hidden="true"></span>
              ${item.dislikes}
            </span>
          </div>
        </div>

        <span class="ts-chevron" aria-hidden="true">›</span>
      </article>
    `;
  }

  function updateContent() {
    const activeSuggestion = suggestions[activeIndex];
    feature.innerHTML = createFeatureMarkup(activeSuggestion);

    list.innerHTML = [1, 2, 3, 4].map(function (offset) {
      const index = (activeIndex + offset) % suggestions.length;
      return createRowMarkup(suggestions[index], index);
    }).join('');
  }

  function render(animate) {
    globalThis.clearTimeout(renderTimer);

    if (!animate) {
      updateContent();
      return;
    }

    feature.classList.add('is-out');

    renderTimer = globalThis.setTimeout(function () {
      updateContent();
      feature.classList.remove('is-out');
    }, transitionDelay);
  }

  function showSuggestion(index, animate) {
    activeIndex = (index + suggestions.length) % suggestions.length;
    render(animate);
  }

  const rotationController = window.AniVortexCarousel.createAutoplayController({
    root: panel,
    interval: rotationInterval,
    tick: () => showSuggestion(activeIndex + 1, true),
    canStart: () => !panel.matches(':hover') && !panel.contains(document.activeElement),
  });

  function stopRotation() {
    rotationController.stop();
  }

  function startRotation() {
    rotationController.start();
  }

  function selectSuggestion(index) {
    showSuggestion(index, true);
    startRotation();
  }

  function updateCategory(direction) {
    categoryIndex = (categoryIndex + direction + categories.length) % categories.length;
    categoryLabel.textContent = categories[categoryIndex];
  }

  list.addEventListener('click', function (event) {
    const row = event.target.closest('.ts-row');
    if (!row || !list.contains(row)) return;
    selectSuggestion(Number(row.dataset.index));
  });

  list.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const row = event.target.closest('.ts-row');
    if (!row || !list.contains(row)) return;

    event.preventDefault();
    selectSuggestion(Number(row.dataset.index));
  });

  previousCategoryButton.addEventListener('click', function () {
    updateCategory(-1);
  });

  nextCategoryButton.addEventListener('click', function () {
    updateCategory(1);
  });

  window.AniVortexCarousel.bindInteractionPause(panel, rotationController);

  // Rotația automată se oprește cât timp utilizatorul interacționează cu panoul.
  render(false);
  startRotation();
});

// ===== HALL OF FAME / LIGA BAGABONȚILOR - JS =====
document.addEventListener("DOMContentLoaded", function() {
const donors = [
  { n: "Patrick Claudiu", a: "63.61" },
  { n: "wmircea", a: "60.61" },
  { n: "Catalin.M", a: "53.00" },
  { n: "tomasciuc30", a: "50.41" },
  { n: "ErvinDe", a: "42.42" },
  { n: "iloe229", a: "34.99" },
  { n: "Flavius321", a: "31.80" },
  { n: "AndreiPro", a: "29.50" },
  { n: "MihaiGamer", a: "27.00" },
  { n: "CristiRO", a: "25.30" },
  { n: "DanielX", a: "23.00" },
  { n: "IonutAlex", a: "21.50" },
  { n: "RazvanM", a: "20.00" },
  { n: "StefanV", a: "18.75" },
  { n: "AlexOtaku", a: "17.20" },
  { n: "VladCostin", a: "15.00" },
  { n: "GabiNinja", a: "14.50" },
  { n: "PopescuA", a: "12.80" },
  { n: "MarianRO", a: "11.00" },
  { n: "TudorFan", a: "10.50" }
];

const donorAvatars = [
  "public/imgs/serii favorite/poze anime/1.webp",
  "public/imgs/serii favorite/poze anime/2.webp",
  "public/imgs/serii favorite/poze anime/3.webp",
  "public/imgs/serii favorite/poze anime/4.webp",
  "public/imgs/serii favorite/poze anime/5.webp",
  "public/imgs/serii favorite/poze anime/6.webp",
  "public/imgs/serii favorite/poze anime/7.webp",
  "public/imgs/serii favorite/poze anime/8.webp",
  "public/imgs/serii favorite/poze anime/9.webp",
  "public/imgs/serii favorite/poze anime/10.webp",
  "public/imgs/serii favorite/poze anime/11.jpg",
  "public/imgs/serii favorite/poze anime/12.jpg",
  "public/imgs/serii favorite/poze anime/13.jpg",
  "public/imgs/serii favorite/poze anime/14.jpg",
  "public/imgs/serii favorite/poze anime/15.jpg",
  "public/imgs/serii favorite/poze anime/16.jpg",
  "public/imgs/serii favorite/poze anime/17.jpg",
  "public/imgs/serii favorite/poze anime/18.jpg",
  "public/imgs/serii favorite/poze anime/19.jpg",
  "public/imgs/serii favorite/poze anime/20.jpg"
];

// Populate donor list
const list = document.getElementById('donorList');
if (list) {
  list.innerHTML = donors.map((d, i) => `<div class="donor-row">
    <span class="rank">#${i + 4}</span>
    <img class="d-avatar" src="${donorAvatars[i % donorAvatars.length]}" alt="Avatar anime pentru ${d.n}" loading="lazy" decoding="async">
    <span class="d-name">${d.n}</span>
    <span class="d-amount">${d.a} €</span>
  </div>`).join('');
}

// Open modal
window.openDonateModal = function openDonateModal() {
  document.getElementById('donateModal').classList.add('show');
};

// Close modal on overlay click
const donateModal = document.getElementById('donateModal');
if (donateModal) {
  donateModal.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
}
}); // end DOMContentLoaded donors


// ======================== SHARE BANNER ========================
document.addEventListener("DOMContentLoaded", function() {
    let shareCountElement = document.getElementById('shareCounterDisplay');
    let currentShares = 194000;
    const twitterBtn = document.getElementById('twitterBtn');

    function formatShares(v) { return v >= 1000 ? Math.floor(v/1000)+'k' : String(v); }

    function updateShareUI() {
        if (!shareCountElement) return;
        shareCountElement.innerText = formatShares(currentShares);
        shareCountElement.style.transform = 'scale(1.08)';
        setTimeout(() => { shareCountElement.style.transform = ''; }, 200);
    }

    if (twitterBtn) {
        twitterBtn.addEventListener('click', function() {
            this.classList.add('click-effect');
            setTimeout(() => this.classList.remove('click-effect'), 200);
        });
    }

    document.querySelectorAll('.sb-btn[data-platform]').forEach(btn => {
        btn.setAttribute('aria-label', `Distribuie pe ${btn.dataset.platform}`);
        btn.addEventListener('click', e => {
            e.preventDefault();
            currentShares++;
            updateShareUI();
        });
    });

    // ===== PLUS DROPDOWN COMPACT =====
    const plusButton = document.getElementById('plusButton');
    const plusDropdown = document.getElementById('plusDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (plusButton && plusDropdown && dropdownMenu) {
        function openDropdown() {
            plusDropdown.classList.add('is-open');
            plusButton.setAttribute('aria-expanded', 'true');
            dropdownMenu.setAttribute('aria-hidden', 'false');
        }

        function closeDropdown() {
            plusDropdown.classList.remove('is-open');
            plusButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        }

        plusButton.setAttribute('aria-expanded', 'false');
        plusButton.setAttribute('aria-haspopup', 'true');
        plusButton.setAttribute('aria-label', 'Mai multe opțiuni de distribuire');

        plusButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (plusDropdown.classList.contains('is-open')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();

            const socialButton = e.target.closest('.sb-btn[data-platform]');
            if (socialButton) {
                closeDropdown();
                plusButton.focus();
            }
        });

        document.addEventListener('click', function(e) {
            if (!plusDropdown.contains(e.target)) {
                closeDropdown();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && plusDropdown.classList.contains('is-open')) {
                closeDropdown();
                plusButton.focus();
            }
        });
    }

    updateShareUI();
});

/* =====================================================
   Reactii pentru noul panou Stirile AniVortex
   ===================================================== */
function initAniVortexNewsReactions() {
  const panel = document.querySelector('.av-news-panel');
  if (!panel || panel.dataset.reactionsReady === 'true') return;

  panel.dataset.reactionsReady = 'true';

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-news-reaction]');
    if (!button || !panel.contains(button)) return;

    const willActivate = !button.classList.contains('is-active');

    panel.querySelectorAll('[data-news-reaction]').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });

    button.classList.toggle('is-active', willActivate);
    button.setAttribute('aria-pressed', String(willActivate));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAniVortexNewsReactions);
} else {
  initAniVortexNewsReactions();
}

/* Activitate staff: maximum 10 caractere vizibile pentru nume. */
function formatStaffActivityNames() {
  document.querySelectorAll('.staff-activity-panel .staff-nm').forEach((nameElement) => {
    const fullName = nameElement.dataset.fullName || nameElement.textContent.trim();
    const characters = Array.from(fullName);

    nameElement.dataset.fullName = fullName;
    nameElement.title = fullName;
    nameElement.setAttribute('aria-label', fullName);
    nameElement.textContent = characters.length > 10
      ? `${characters.slice(0, 10).join('')}...`
      : fullName;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', formatStaffActivityNames);
} else {
  formatStaffActivityNames();
}

/* =====================================================================
   LOGIN CONTENT V2 — INTERACȚIUNI
   ===================================================================== */
function toggleAniVortexNotifications(event) {
  event?.stopPropagation();
  const profile = document.querySelector('.av-profile-v2');
  const button = profile?.querySelector('#avProfileNotifications');
  const menu = profile?.querySelector('#avProfileNotificationMenu');
  const statusButton = profile?.querySelector('#avProfileStatus');
  const statusMenu = profile?.querySelector('#avProfileStatusMenu');
  if (!button || !menu) return;

  const willOpen = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(willOpen));
  menu.setAttribute('aria-hidden', String(!willOpen));
  menu.classList.toggle('is-open', willOpen);

  if (statusButton && statusMenu) {
    statusButton.setAttribute('aria-expanded', 'false');
    statusMenu.setAttribute('aria-hidden', 'true');
    statusMenu.classList.remove('is-open');
  }
}

function initAniVortexProfileV2() {
  const profile = document.querySelector('.av-profile-v2');
  if (!profile || profile.dataset.initialized === 'true') return;
  profile.dataset.initialized = 'true';

  const toast = profile.querySelector('.av-profile-toast');
  const statusButton = profile.querySelector('#avProfileStatus');
  const statusMenu = profile.querySelector('#avProfileStatusMenu');
  const statusChoices = statusMenu?.querySelectorAll('[data-av-status]') || [];
  const notificationButton = profile.querySelector('#avProfileNotifications');
  const notificationMenu = profile.querySelector('#avProfileNotificationMenu');
  const notificationBadge = profile.querySelector('.av-profile-notification-badge');
  let toastTimer;

  const showProfileToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 1800);
  };

  const actionMessages = {
    'profile-settings': 'Pagina pentru setările profilului va fi adăugată ulterior.',
    'faction-settings': 'Pagina pentru setările facțiunii va fi adăugată ulterior.',
    logout: 'Conectează aici funcția reală de deconectare.'
  };

  profile.querySelectorAll('[data-av-profile-action]').forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.dataset.avProfileAction;
      const destination = control.dataset.avProfileHref;
      showProfileToast(actionMessages[action] || 'Acțiune selectată.');

      profile.dispatchEvent(new CustomEvent('anivortex:profile-action', {
        bubbles: true,
        detail: { action }
      }));

      if (destination) {
        window.location.assign(destination);
      }
    });
  });

  const notificationCount = notificationMenu
    ? notificationMenu.querySelectorAll(':scope > a:not(.av-profile-notification-all)').length
    : 0;

  if (notificationBadge) {
    notificationBadge.textContent = notificationCount ? String(notificationCount) : '';
    notificationBadge.hidden = notificationCount === 0;
    notificationBadge.setAttribute('aria-label', `${notificationCount} notificări necitite`);
  }

  const setPopupState = (button, menu, open) => {
    if (!button || !menu) return;
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('is-open', open);
  };

  const closeProfileMenus = () => {
    setPopupState(statusButton, statusMenu, false);
    setPopupState(notificationButton, notificationMenu, false);
  };

  statusButton?.setAttribute('data-status', 'online');
  statusChoices[0]?.classList.add('is-selected');

  statusButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = statusButton.getAttribute('aria-expanded') !== 'true';
    setPopupState(notificationButton, notificationMenu, false);
    setPopupState(statusButton, statusMenu, willOpen);
  });

  notificationButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = notificationButton.getAttribute('aria-expanded') !== 'true';
    setPopupState(statusButton, statusMenu, false);
    setPopupState(notificationButton, notificationMenu, willOpen);
  });

  statusChoices.forEach((choice) => {
    choice.addEventListener('click', (event) => {
      event.stopPropagation();
      const status = choice.dataset.avStatus;
      const label = choice.textContent.trim().toLowerCase();

      statusChoices.forEach((item) => item.classList.remove('is-selected'));
      choice.classList.add('is-selected');
      statusButton.dataset.status = status;
      statusButton.setAttribute('aria-label', `Stare: ${label}`);
      setPopupState(statusButton, statusMenu, false);
      showProfileToast(`Stare schimbată: ${label}.`);
    });
  });

  statusMenu?.addEventListener('click', (event) => event.stopPropagation());
  notificationMenu?.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', closeProfileMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeProfileMenus();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAniVortexProfileV2, { once: true });
} else {
  initAniVortexProfileV2();
}



