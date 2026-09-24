(() => {
  'use strict';

  const comments = [
    {
      username: 'KiraMoon',
      time: 'acum 18 min',
      avatar: 'public/icons/avatar/Anne-v1.1.webp',
      text: 'Episodul a fost superb! Mi-au plăcut animația, muzica și felul în care au construit momentul de la final. Mulțumesc pentru traducerea rapidă! 💙',
      series: 'Bleach: Thousand-Year Blood War',
      seriesUrl: '/anime/bleach-thousand-year-blood-war/',
      seriesMeta: 'S1 Ep. 211',
      reactions: [7, 4, 1], accent: '#d8b872', symbol: 'Dragon.webp'
    },
    {
      username: 'DariusOtaku',
      time: 'acum 35 min',
      avatar: 'public/imgs/user/aot.webp',
      text: 'Nu mă așteptam deloc la întorsătura asta. Următorul episod pare că va schimba complet direcția poveștii.',
      series: 'Attack on Titan',
      seriesUrl: '/anime/attack-on-titan/',
      seriesMeta: 'S4 Ep. 87',
      reactions: [12, 3, 2], accent: '#ff9b7c', symbol: 'Fulger.webp'
    },
    {
      username: 'HanaBloom',
      time: 'acum 52 min',
      avatar: 'public/imgs/user/n.webp',
      text: 'Revederea acestui arc mi-a amintit de ce iubesc atât de mult seria. Personajele chiar cresc frumos de la un episod la altul. 🌸',
      series: 'Naruto Shippuden',
      seriesUrl: '/anime/naruto-shippuden/',
      seriesMeta: 'S2 Ep. 123',
      reactions: [9, 6, 0], accent: '#f09ac1', symbol: 'Sakura.webp'
    },
    {
      username: 'ZenitsuRo',
      time: 'acum 2 ore',
      avatar: 'public/imgs/card/3.webp',
      text: 'Scena de luptă a fost incredibilă, iar coloana sonoră a făcut totul și mai intens. Am reluat finalul de două ori!',
      series: 'Chainsaw Man',
      seriesUrl: '/anime/chainsaw-man/',
      seriesMeta: 'S1 Ep. 45',
      reactions: [15, 5, 1], accent: '#f2cf65', symbol: 'Foc.webp'
    },
    {
      username: 'MomoChan',
      time: 'acum 2 ore',
      avatar: 'public/imgs/card/1.jpg',
      text: 'Un episod mai liniștit, dar exact ce trebuia după atâta acțiune. Dialogurile dintre personaje au fost foarte naturale.',
      series: 'My Hero Academia',
      seriesUrl: '/anime/my-hero-academia/',
      seriesMeta: 'S6 Ep. 18',
      reactions: [6, 8, 0], accent: '#9fe27b', symbol: 'Luna.webp'
    },
    {
      username: 'LeviFan',
      time: 'acum 3 ore',
      avatar: 'public/imgs/card/6.jpg',
      text: 'Familia asta reușește să transforme orice misiune într-un haos adorabil. Anya a fost din nou cea mai amuzantă. 😂',
      series: 'Spy x Family',
      seriesUrl: '/anime/spy-x-family/',
      seriesMeta: 'S2 Ep. 29',
      reactions: [11, 9, 0], accent: '#bf9bff', symbol: 'Vulpe.webp'
    },
    {
      username: 'AkiNoir',
      time: 'acum 3 ore',
      avatar: 'public/imgs/card/7.jpg',
      text: 'Meciul a avut un ritm foarte bun și fiecare jucător a primit momentul lui. Abia aștept să văd noua formulă a echipei.',
      series: 'Blue Lock',
      seriesUrl: '/anime/blue-lock/',
      seriesMeta: 'S1 Ep. 201',
      reactions: [8, 2, 1], accent: '#79b8ff', symbol: 'Fluture.webp'
    },
    {
      username: 'RinaSakura',
      time: 'acum 4 ore',
      avatar: 'public/imgs/card/8.jpg',
      text: 'Kaiju-ul nou arată excelent, iar atmosfera a devenit mult mai tensionată. Sper să aflăm mai multe despre trecutul lui Kafka.',
      series: 'Kaiju No. 8',
      seriesUrl: '/anime/kaiju-no-8/',
      seriesMeta: 'S1 Ep. 11',
      reactions: [10, 5, 0], accent: '#76e4d0', symbol: 'Val.webp'
    },
    {
      username: 'TobiWave',
      time: 'acum 5 ore',
      avatar: 'public/imgs/card/9.jpg',
      text: 'Ciudat, energic și surprinzător de emoționant. Exact combinația pentru care urmăresc seria în fiecare săptămână.',
      series: 'Dan Da Dan',
      seriesUrl: '/anime/dan-da-dan/',
      seriesMeta: 'S3 Ep. 64',
      reactions: [13, 7, 2], accent: '#f4a261', symbol: 'Corb.webp'
    },
    {
      username: 'MeiHikari',
      time: 'acum 5 ore',
      avatar: 'public/imgs/card/10.jpg',
      text: 'Decorurile insulei sunt superbe, chiar dacă totul devine din ce în ce mai periculos. Finalul m-a lăsat cu multe întrebări.',
      series: "Hell's Paradise",
      seriesUrl: '/anime/hells-paradise/',
      seriesMeta: 'S1 Ep. 9',
      reactions: [7, 3, 1], accent: '#8fd3ff', symbol: 'Phoenix.webp'
    },
    {
      username: 'KuroNeko',
      time: 'acum 6 ore',
      avatar: 'public/imgs/card/11.jpg',
      text: 'Un episod matur și bine construit. Mi-a plăcut că au lăsat scenele importante să respire fără să grăbească povestea.',
      series: 'Vinland Saga',
      seriesUrl: '/anime/vinland-saga/',
      seriesMeta: 'S2 Ep. 47',
      reactions: [16, 10, 0], accent: '#d7aa72', symbol: 'Lup.webp'
    },
    {
      username: 'EmiStar',
      time: 'acum 8 ore',
      avatar: 'public/imgs/card/13.jpg',
      text: 'Asta da revenire! Noile vrăji arată foarte bine, iar echipa pare în sfârșit pregătită pentru confruntarea principală.',
      series: 'Black Clover',
      seriesUrl: '/anime/black-clover/',
      seriesMeta: 'S5 Ep. 102',
      reactions: [14, 6, 1], accent: '#c9a5ff', symbol: 'Tigru.webp'
    },
    {
      username: 'SoraYume',
      time: 'acum 9 ore',
      avatar: 'public/imgs/card/4.jpg',
      text: 'Energia acestui episod a fost incredibilă. Mi-a plăcut că au păstrat echilibrul între umor și tensiunea luptei.',
      series: 'Jujutsu Kaisen',
      seriesUrl: '/anime/jujutsu-kaisen/',
      seriesMeta: 'S2 Ep. 24',
      reactions: [18, 8, 2], accent: '#8db4ff', symbol: 'Sarpe.webp'
    },
    {
      username: 'NekoPulse',
      time: 'acum 10 ore',
      avatar: 'public/imgs/card/2.jpg',
      text: 'Mi-a plăcut cât de bine au construit emoția aici. Finalul a fost simplu, dar a avut mult impact.',
      series: 'Frieren',
      seriesUrl: '/anime/frieren/',
      seriesMeta: 'S1 Ep. 28',
      reactions: [12, 9, 1], accent: '#93e6b7', symbol: 'Lotus.webp'
    },
    {
      username: 'AkiraStorm',
      time: 'acum 11 ore',
      avatar: 'public/imgs/card/5.jpg',
      text: 'Vizual episodul a fost superb, iar ritmul s-a simțit mult mai bine decât săptămâna trecută. Clar un episod reușit.',
      series: 'Solo Leveling',
      seriesUrl: '/anime/solo-leveling/',
      seriesMeta: 'S2 Ep. 13',
      reactions: [20, 7, 2], accent: '#7de0ff', symbol: 'Cristal.webp'
    },
    {
      username: 'YukiZen',
      time: 'acum 12 ore',
      avatar: 'public/imgs/card/12.jpg',
      text: 'Mi-a plăcut ideea episodului și mai ales felul în care au scos în față personajele secundare. A mers excelent.',
      series: 'Dr. Stone',
      seriesUrl: '/anime/dr-stone/',
      seriesMeta: 'S3 Ep. 56',
      reactions: [11, 4, 1], accent: '#f4c27a', symbol: 'Coroana.webp'
    },
    {
      username: 'ReiNova',
      time: 'acum 13 ore',
      avatar: 'public/imgs/card/14.jpg',
      text: 'M-a prins complet episodul. Atmosfera a fost densă și au știut exact când să accelereze și când să lase scena să respire.',
      series: 'Demon Slayer',
      seriesUrl: '/anime/demon-slayer/',
      seriesMeta: 'S4 Ep. 19',
      reactions: [19, 11, 3], accent: '#ffa6b7', symbol: 'Stea.webp'
    },
    {
      username: 'HoshiKitsune',
      time: 'acum 14 ore',
      avatar: 'public/imgs/card/15.jpg',
      text: 'Genul de episod care îți dă chef să revezi toată seria. Muzica și cadrele au fost exact ce trebuia.',
      series: 'One Piece',
      seriesUrl: '/anime/one-piece/',
      seriesMeta: 'S20 Ep. 109',
      reactions: [24, 13, 4], accent: '#ffce72', symbol: 'Soare.webp'
    },
    {
      username: 'MikaTora',
      time: 'acum 16 ore',
      avatar: 'public/imgs/card/16.jpg',
      text: 'Foarte bun episodul. A avut impact și pe acțiune, dar și pe partea de personaje, ceea ce nu se întâmplă mereu.',
      series: 'Fire Force',
      seriesUrl: '/anime/fire-force/',
      seriesMeta: 'S1 Ep. 33',
      reactions: [13, 5, 1], accent: '#ff8d6d', symbol: 'Oni.webp'
    },
    {
      username: 'ShinRaven',
      time: 'acum 18 ore',
      avatar: 'public/imgs/serii favorite/poze anime/17.jpg',
      text: 'M-a surprins cât de bine a fost montat episodul. Nu a avut momente moarte și s-a simțit foarte fluid de la cap la coadă.',
      series: 'Tokyo Revengers',
      seriesUrl: '/anime/tokyo-revengers/',
      seriesMeta: 'S2 Ep. 15',
      reactions: [10, 6, 2], accent: '#8ac8ff', symbol: 'Vant.webp'
    }
  ];

  const categories = ['Anime', 'Manga', 'Desene', 'Live-action', 'Filme/Seriale', 'Cărți'];
  const iconPaths = {
    like: 'M7 10v10H3V10h4Zm3 10H8V10l4-7c1.7.2 2.4 1.3 2 3l-.6 3H19a2 2 0 0 1 2 2.3l-1 6A3 3 0 0 1 17 20h-7Z',
    love: 'M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z',
    reply: 'M6 6l12 12M18 6 6 18'
  };

  const state = {
    start: 0,
    filter: 'new',
    category: 0,
    paused: false,
    timer: null,
    reactions: new Map()
  };

  const escapeHtml = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const icon = type => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[type]}"></path></svg>`;
  const reactionKey = (name, type) => `${name}:${type}`;

  function orderedComments() {
    return state.filter === 'top'
      ? [...comments].sort((a, b) => (b.reactions[0] + b.reactions[1]) - (a.reactions[0] + a.reactions[1]))
      : comments;
  }

  function reactionButton(comment, type, label, index) {
    const active = state.reactions.get(reactionKey(comment.username, type)) === true;
    const count = comment.reactions[index] + (active ? 1 : 0);
    return `<button type="button" class="av10-reaction ${type}${active ? ' is-active' : ''}" data-reaction="${type}" data-name="${escapeHtml(comment.username)}" aria-label="${label}: ${count}" aria-pressed="${active}">${icon(type)}<span>${count}</span></button>`;
  }

  function cardTemplate(comment, number) {
    return `<article class="av10-card" style="--accent:${comment.accent};--motion-delay:${number * -0.85}s">
      <div class="av10-glow"></div>
      <div class="av10-geometry" aria-hidden="true">
        <span class="av10-ring av10-ring-large"></span>
        <span class="av10-ring av10-ring-small"></span>
        <span class="av10-line av10-line-one"></span>
        <span class="av10-line av10-line-two"></span>
        <span class="av10-dot"></span>
      </div>
      <span class="av10-number" aria-hidden="true">${String(number).padStart(2, '0')}</span>

      <header class="av10-head">
        <div class="av10-avatar-wrap">
          <span class="av10-avatar"><img src="${escapeHtml(comment.avatar)}" alt="Avatar anime ${escapeHtml(comment.username)}" loading="lazy" decoding="async"></span>
          <span class="av10-online" aria-hidden="true"></span>
        </div>
        <div class="av10-identity"><strong class="av10-name">${escapeHtml(comment.username)}</strong><time class="av10-time">${escapeHtml(comment.time)}</time></div>
      </header>

      <div class="av10-message">
        <a class="av10-series" href="${escapeHtml(comment.seriesUrl)}" aria-label="Deschide seria ${escapeHtml(comment.series)}">
          <span class="av10-series-copy"><small>Comentariu la seria</small><strong>${escapeHtml(comment.series)}</strong><em class="av10-series-meta">${escapeHtml(comment.seriesMeta || "S1 Ep. 123")}</em></span>
          <span class="av10-series-arrow" aria-hidden="true">›</span>
        </a>
        <div class="av10-body"><p class="av10-text">${escapeHtml(comment.text)}</p><span class="av10-symbol" data-symbol="${escapeHtml(comment.symbol.replace(/\.[^.]+$/, ''))}" aria-hidden="true"><img class="av10-symbol-img" src="public/imgs/simboluri/${escapeHtml(comment.symbol)}" alt="" loading="lazy" decoding="async"></span></div>
      </div>

      <footer class="av10-footer">
        <div class="av10-reactions" aria-label="Reacții">
          ${reactionButton(comment, 'like', 'Îmi place', 0)}
          ${reactionButton(comment, 'love', 'Ador', 1)}
          ${reactionButton(comment, 'reply', 'Răspunde', 2)}
        </div>
      </footer>
    </article>`;
  }

  function enhanceTitle() {
    const group = document.querySelector('.comentarii-title-group');
    const title = group?.querySelector('h2');
    if (!group || !title || group.querySelector('.com-eyebrow')) return;

    const eyebrow = document.createElement('span');
    eyebrow.className = 'com-eyebrow';
    eyebrow.textContent = 'Comunitatea AniVortex · live';

    const line = document.createElement('span');
    line.className = 'comentarii-title-line';
    const liveCount = document.createElement('span');
    liveCount.className = 'com-live-count';
    liveCount.textContent = '20 noi';

    title.replaceWith(line);
    line.append(title, liveCount);
    group.prepend(eyebrow);
  }

  function render(track) {
    const list = orderedComments();
    const visibleCount = Math.min(6, list.length);

    // Nu amestecăm finalul listei cu începutul (ex: 20, 1, 2, 3...).
    // Dacă nu mai încap 6 carduri consecutive, revenim direct la 1.
    if (state.start + visibleCount > list.length) {
      state.start = 0;
    }

    const visible = list.slice(state.start, state.start + visibleCount);
    track.innerHTML = visible
      .map((comment, index) => cardTemplate(comment, state.start + index + 1))
      .join('');

    // CSP-safe fallback: avoid inline onerror handlers in generated markup.
    track.querySelectorAll('.av10-avatar img').forEach((image) => {
      image.addEventListener('error', () => {
        if (image.dataset.fallbackApplied === '1') return;
        image.dataset.fallbackApplied = '1';
        image.src = 'public/icons/avatar/anne.webp';
      }, { once: true });
    });
  }

  function restartTimer(track) {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
    if (state.paused || !window.AniVortexPerf.canRunAutoMotion()) return;
    state.timer = window.setInterval(() => {
      const listLength = orderedComments().length;
      const visibleCount = Math.min(6, listLength);
      const lastFullStart = Math.max(0, listLength - visibleCount);

      // După ultima fereastră completă (15–20), revenim la 1–6.
      state.start = state.start >= lastFullStart ? 0 : state.start + 1;
      render(track);
    }, 15000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.comentarii-track');
    if (!track) return;

    enhanceTitle();

    const tabs = [...document.querySelectorAll('.com-tab')];
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-pressed', String(index === 0));
      tab.addEventListener('click', () => {
        state.filter = index === 0 ? 'new' : 'top';
        state.start = 0;
        tabs.forEach((item, itemIndex) => {
          const active = itemIndex === index;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        render(track);
        restartTimer(track);
      });
    });

    const selector = document.getElementById('categorySelector');
    const label = document.getElementById('categoryLabel');
    selector?.addEventListener('click', () => {
      state.category = (state.category + 1) % categories.length;
      if (label) label.textContent = categories[state.category];
      selector.setAttribute('aria-label', `Categoria curentă: ${categories[state.category]}. Schimbă categoria`);
    });

    track.addEventListener('click', event => {
      const button = event.target.closest('[data-reaction]');
      if (!button) return;

      const name = button.dataset.name;
      const type = button.dataset.reaction;
      const clickedKey = reactionKey(name, type);
      const wasActive = state.reactions.get(clickedKey) === true;

      // Un utilizator poate avea activa o singura reactie pe comentariu.
      // Cand alegi Like / Ador / X, celelalte doua se dezactiveaza automat.
      ['like', 'love', 'reply'].forEach(reactionType => {
        state.reactions.set(reactionKey(name, reactionType), false);
      });

      // Daca apesi din nou pe reactia deja activa, o dezactivezi complet.
      if (!wasActive) {
        state.reactions.set(clickedKey, true);
      }

      render(track);
    });

    track.addEventListener('mouseenter', () => { state.paused = true; restartTimer(track); });
    track.addEventListener('mouseleave', () => { state.paused = false; restartTimer(track); });
    track.addEventListener('focusin', () => { state.paused = true; restartTimer(track); });
    track.addEventListener('focusout', () => { state.paused = false; restartTimer(track); });
    window.AniVortexPerf.onAutoMotionChange(() => restartTimer(track));

    render(track);
    restartTimer(track);
  });
})();
