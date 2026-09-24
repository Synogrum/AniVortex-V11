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

