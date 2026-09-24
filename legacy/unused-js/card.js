// Accesare sigură dintr-un NodeList/Array
function getSafe(collection, index) {
    if (index >= 0 && index < collection.length) {
        return collection[index];
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function () {

    /* ============================================================
       TITLE TRUNCATION
       ============================================================ */

    // Folosim rAF pentru a ne asigura că layout-ul e calculat corect
    requestAnimationFrame(() => {
        document.querySelectorAll('.anime-title').forEach(title => {
            const container = title.closest('.anime-card');
            const maxHeight = container ? container.getBoundingClientRect().height - 10 : 150;
            const originalText = title.textContent.trim();

            title.textContent = originalText;
            const titleHeight = title.getBoundingClientRect().height;

            if (titleHeight > maxHeight) {
                const maxChars = 16;
                let truncatedText = originalText.slice(0, maxChars);
                if (originalText.length > maxChars) {
                    truncatedText += '...';
                }
                title.textContent = truncatedText;
                title.setAttribute('title', originalText);
            }
        });
    });


    /* ============================================================
       CARD CAROUSEL — CONFIG
       ============================================================ */

    const cards = document.querySelectorAll('.anime-card');
    const images = document.querySelectorAll('.anime-image');
    const totalCards = cards.length;

    // Constante pentru calculul pozițiilor (ușor de modificat)
    const VISIBLE_COUNT = 8;
    const CARD_START = 90;       // prima poziție card (px)
    const CARD_GAP = 169;        // distanța între carduri (px)
    const IMAGE_START = 125;     // prima poziție imagine (px)
    const IMAGE_GAP = 217.5;     // distanța între imagini (px)
    const IMAGE_TOP = '-190px';  // top comun pentru toate imaginile

    // Generează pozițiile dinamic în loc de 8 obiecte hardcodate
    const positions = Array.from({ length: VISIBLE_COUNT }, (_, i) => ({
        left: `${CARD_START + Math.round(CARD_GAP * i)}px`
    }));

    const imagePositions = Array.from({ length: VISIBLE_COUNT }, (_, i) => ({
        top: IMAGE_TOP,
        left: `${IMAGE_START + IMAGE_GAP * i}px`
    }));

    let displayedCards = Array.from({ length: VISIBLE_COUNT }, (_, i) => i);
    let nextCardIndex = VISIBLE_COUNT;
    let isResetting = false;
    let intervalId = null;

    function stopRotationTimer() {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
    }

    function startRotationTimer() {
        stopRotationTimer();
        if (!window.AniVortexPerf.canRunAutoMotion()) return;
        intervalId = setInterval(() => {
            rotateCards();
            resetCards();
        }, 5000);
    }


    /* ============================================================
       HELPERS
       ============================================================ */

    function setCardPosition(cardIndex, positionIndex) {
        const card = getSafe(cards, cardIndex);
        const pos = getSafe(positions, positionIndex);
        if (card && pos) card.style.left = pos.left;

        const image = getSafe(images, cardIndex);
        const imgPos = getSafe(imagePositions, positionIndex);
        if (image && imgPos) {
            image.style.top = imgPos.top;
            image.style.left = imgPos.left;
        }
    }


    /* ============================================================
       DISPLAY & ROTATION
       ============================================================ */

    function updateDisplay() {
        cards.forEach(card => card.style.display = 'none');
        images.forEach(img => img.style.display = 'none');

        displayedCards.forEach((cardIndex, positionIndex) => {
            const card = getSafe(cards, cardIndex);
            if (card) card.style.display = 'flex';

            const image = getSafe(images, cardIndex);
            if (image) image.style.display = 'block';

            setCardPosition(cardIndex, positionIndex);
        });
    }

    function rotateCards() {
        displayedCards.shift();
        displayedCards.push(nextCardIndex);
        nextCardIndex = (nextCardIndex + 1) % totalCards;
        if (nextCardIndex === 0) {
            isResetting = true;
        }
        animateTransition();
    }

    function animateTransition() {
        displayedCards.forEach((cardIndex, positionIndex) => {
            const card = getSafe(cards, cardIndex);
            if (card) card.style.transition = 'transform 0.5s ease-out';

            const image = getSafe(images, cardIndex);
            if (image) image.style.transition = 'transform 0.5s ease-out';

            setCardPosition(cardIndex, positionIndex);
        });
        updateDisplay();
    }

    function resetCards() {
        if (isResetting) {
            stopRotationTimer();
            setTimeout(() => {
                displayedCards = Array.from({ length: VISIBLE_COUNT }, (_, i) => i);
                nextCardIndex = VISIBLE_COUNT;
                isResetting = false;
                updateDisplay();

                // Pornim un singur interval nou, doar când animațiile automate sunt permise.
                startRotationTimer();
            }, 5000);
        }
    }


    /* ============================================================
       INIT
       ============================================================ */

    updateDisplay();

    startRotationTimer();
    window.AniVortexPerf.onAutoMotionChange((canRun) => {
        if (canRun) startRotationTimer();
        else stopRotationTimer();
    });
});