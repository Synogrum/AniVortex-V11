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

