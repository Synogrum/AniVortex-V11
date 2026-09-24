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
