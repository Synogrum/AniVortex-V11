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

