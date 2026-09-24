/* ================================
   Functiea de swipe pentru stiri
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
  const stiri = Array.from(document.querySelectorAll('.stire-card'));
  if (stiri.length < 2) return;

  let index = 0;
  const VIZIBILE = 2;

  function updateView() {
    stiri.forEach((card, i) => {
      const visible = (i >= index && i < index + VIZIBILE);
      card.style.display = visible ? "flex" : "none";
      card.style.opacity = visible ? "1" : "0";

    });
  }

  updateView(); // inițial

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon.up');
    if (!btn) return;

    index++;

    if (index > stiri.length - VIZIBILE) {
      index = 0;
    }

    updateView();
  });
});

/* ================================
   Functiea de like pentru stiri
   ============================== */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.icon.like, .icon.dislike');
  if (!btn) return;

  const counter = btn.querySelector('.counter');

  let value = Number.parseInt(counter.textContent, 10);
  if (Number.isNaN(value)) value = 0;

  value++;
  counter.textContent = value;

  // Devine vizibil doar când e > 0
  counter.style.display = 'flex';

  // feedback vizual
  btn.classList.add('active');
  setTimeout(() => {
    btn.classList.remove('active');
  }, 200);
});

/* Textul știrilor este limitat nativ din CSS; fără măsurători sincronizate în JS. */
