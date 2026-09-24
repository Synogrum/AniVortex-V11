document.addEventListener('DOMContentLoaded', () => {
    const VISIBLE_COUNT = 8;
    const ANIMATION_MS = 660;
    const AUTO_BASE_MS = 4300;

    document.querySelectorAll('.carousel-collection .carousel-container').forEach((container, rowIndex) => {
        const track = container.querySelector('.carousel-track');
        if (!track) return;

        const section = container.closest('.carousel-section');
        const dataKey = section?.classList.contains('carti')
            ? 'carti'
            : section?.classList.contains('filme-seriale')
                ? 'filme-seriale'
                : 'live-action';
        const sourceCards = Array.from(window.AniVortexEntertainmentData?.[dataKey] || []);

        // V28: statusurile sunt limitate la cele 3 valori cerute.
        const ALLOWED_STATUSES = ['ON-GOING', 'ÎN TRADUCERE', 'COMPLET'];

        const normalizeStatus = (value, fallbackIndex) => {
            const raw = String(value || '').trim().toUpperCase();
            if (raw === 'ON-GOING' || raw === 'ONGOING') return 'ON-GOING';
            if (raw === 'ÎN TRADUCERE' || raw === 'IN TRADUCERE') return 'ÎN TRADUCERE';
            if (raw === 'COMPLET' || raw === 'COMPLETE') return 'COMPLET';
            return ALLOWED_STATUSES[fallbackIndex % ALLOWED_STATUSES.length];
        };

        const categoryLabel = dataKey === 'carti'
            ? 'CĂRȚI'
            : dataKey === 'filme-seriale'
                ? 'FILME & SERIALE'
                : 'LIVE-ACTION';
        const isBook = categoryLabel === 'CĂRȚI';
        const cardCache = new Map();

        function escapeMarkup(value) {
            return String(value ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        }

        function createCard(source, cardIndex) {
            const title = String(source.title || '').trim();
            const year = String(source.year || '—').trim();
            const type = String(source.type || 'SERIE').trim();
            const duration = String(source.duration || '—').trim();
            const rating = String(source.rating || '—').trim();
            const description = String(source.description || '').trim() || 'Detalii despre serie vor fi disponibile în curând.';
            const status = normalizeStatus(source.status, cardIndex);
            const number = String((cardIndex % 12) + 1).padStart(2, '0');
            const episodeLabel = isBook ? 'CAP.' : 'EP.';
            const quality = isBook ? 'DIGITAL' : 'FULL HD';

            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${escapeMarkup(source.image)}" alt="${escapeMarkup(source.alt || title)}" width="${Number(source.width) || 189}" height="${Number(source.height) || 267}" loading="lazy" decoding="async" fetchpriority="low">
                    </div>
                </div>
                <div class="card-label">${escapeMarkup(title)}</div>
                <div class="av-card-front-meta">
                    <span class="av-front-year">${escapeMarkup(year)}</span>
                    <i class="av-front-dot" aria-hidden="true"></i>
                    <span class="av-front-status" data-status="${escapeMarkup(status)}">${escapeMarkup(status)}</span>
                </div>`;

            card.dataset.status = status;
            card.dataset.popupYear = year;
            card.dataset.popupType = type;
            card.dataset.popupTitle = title;
            card.dataset.popupDescription = description;
            card.dataset.popupDuration = duration;
            card.dataset.popupRating = rating;
            card.dataset.popupCategory = categoryLabel;
            card.dataset.popupEpisodeLabel = episodeLabel;
            card.dataset.popupQuality = quality;
            card.dataset.popupNumber = number;
            card.dataset.popupUrl = source.url || 'link-read.html';
            if (source.genre) card.dataset.genre = String(source.genre).trim();

            card.setAttribute('aria-label', `${title}, ${year}, ${status}. Apasă pentru detalii.`);
            card.setAttribute('aria-expanded', 'false');
            card.setAttribute('aria-controls', `av-card-popover-${rowIndex}`);
            card.setAttribute('aria-haspopup', 'dialog');
            card.setAttribute('tabindex', '0');
            return card;
        }

        function cardAtSource(index) {
            const normalized = (index + sourceCards.length) % sourceCards.length;
            if (!cardCache.has(normalized)) {
                cardCache.set(normalized, createCard(sourceCards[normalized], normalized));
            }
            return cardCache.get(normalized);
        }

        const total = sourceCards.length;
        if (total < VISIBLE_COUNT) return;

        let startIndex = 0;
        let visibleCards = [];
        let busy = false;
        let pointerStartX = null;
        let pointerMoved = false;
        let pointerCaptured = false;


        let modalOpen = false;
        let activePopupCard = null;
        let popupHideTimer = null;
        const popupTitleId = `av-popup-title-${rowIndex}`;
        const popup = document.createElement('div');
        popup.id = `av-card-popover-${rowIndex}`;
        popup.className = 'av-card-popover-wrap';
        popup.setAttribute('hidden', '');
        popup.innerHTML = `
            <div class="av-popup-panel" role="dialog" aria-modal="false" aria-labelledby="${popupTitleId}">
                <div class="av-popup-top">
                    <span class="av-popup-category"></span>
                    <span class="av-popup-rating"></span>
                </div>

                <h3 class="av-popup-title" id="${popupTitleId}"></h3>

                <div class="av-popup-trio">
                    <div class="av-popup-info">
                        <small>Durată</small>
                        <strong class="av-popup-duration"></strong>
                    </div>

                    <div class="av-popup-center">
                        <small class="av-popup-episode-label"></small>
                        <b class="av-popup-number"></b>
                    </div>

                    <div class="av-popup-info">
                        <small>Calitate</small>
                        <strong class="av-popup-quality"></strong>
                    </div>
                </div>

                <div class="av-popup-desc">
                    <small>DESCRIEREA SERIEI</small>
                    <p class="av-popup-description"></p>
                </div>

                <div class="av-popup-footer">
                    <div>
                        <small>Postat</small>
                        <strong class="av-popup-posted"></strong>
                    </div>
                    <i aria-hidden="true"></i>
                    <div>
                        <small>Gen</small>
                        <strong class="av-popup-genre-footer"></strong>
                    </div>
                </div>

                <button class="av-popup-watch" type="button">▶ Vezi seria</button>
            </div>
        `;
        document.body.appendChild(popup);

        const popupPanel = popup.querySelector('.av-popup-panel');
        const popupCategory = popup.querySelector('.av-popup-category');
        const popupRating = popup.querySelector('.av-popup-rating');
        const popupTitle = popup.querySelector('.av-popup-title');
        const popupDuration = popup.querySelector('.av-popup-duration');
        const popupEpisodeLabel = popup.querySelector('.av-popup-episode-label');
        const popupNumber = popup.querySelector('.av-popup-number');
        const popupQuality = popup.querySelector('.av-popup-quality');
        const popupDescription = popup.querySelector('.av-popup-description');
        const popupPosted = popup.querySelector('.av-popup-posted');
        const popupGenreFooter = popup.querySelector('.av-popup-genre-footer');
        const popupWatch = popup.querySelector('.av-popup-watch');

        const postedDate = new Intl.DateTimeFormat('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date());

        function isPopupOpen() {
            return modalOpen;
        }

        function positionPopup(card) {
            if (!card || popup.hidden) return;

            const gap = 12;
            const safe = 8;

            /* V45:
               - lățimea se raportează la poster;
               - înălțimea se raportează la ÎNTREG cardul (poster + nume + an/status).
               Asta elimină aspectul "tăiat" din V43 și oferă spațiu real pentru
               descriere, footer și buton fără artificii cu translateY. */
            const poster = card.querySelector('.card-inner') || card;
            const posterRect = poster.getBoundingClientRect();
            const fullCardRect = card.getBoundingClientRect();
            const desktop = window.matchMedia('(min-width: 721px)').matches;
            const viewportPadding = 8;
            const maxPopupWidth = Math.max(220, window.innerWidth - viewportPadding * 2);
            const maxPopupHeight = Math.max(260, window.innerHeight - viewportPadding * 2);

            const desiredWidth = Math.round(posterRect.width + (desktop ? 52 : 42));
            const desiredHeight = Math.round(fullCardRect.height + (desktop ? 4 : 2));

            const popupWidth = Math.min(
                maxPopupWidth,
                Math.max(desktop ? 224 : 210, desiredWidth)
            );
            const popupHeight = Math.min(
                maxPopupHeight,
                Math.max(desktop ? 286 : 266, desiredHeight)
            );

            popupPanel.style.width = `${popupWidth}px`;
            popupPanel.style.height = `${popupHeight}px`;
            popupPanel.style.maxWidth = `${popupWidth}px`;
            popupPanel.style.maxHeight = `${popupHeight}px`;

            /* V46: poziționarea este centralizată în AniVortexPopup, păstrând
               aceeași geometrie: X după poster, Y după întregul card. */
            const popupLift = desktop ? 8 : 6;
            const placement = window.AniVortexPopup.placeAdjacent(popupPanel, posterRect, {
                verticalRect: fullCardRect,
                prefer: 'right',
                fallback: 'left',
                gap,
                safe,
                vertical: 'center',
                topOffset: -popupLift,
                width: popupWidth,
                height: popupHeight,
            });
            const { top, side } = placement;

            /* Săgeata rămâne ancorată în centrul POSTERULUI, nu în centrul
               cardului complet, ca legătura vizuală să fie clară. */
            const anchorY = Math.max(
                22,
                Math.min(
                    popupHeight - 22,
                    posterRect.top + posterRect.height / 2 - top
                )
            );

            popupPanel.style.setProperty(
                '--av-popover-arrow-y',
                `${Math.round(anchorY)}px`
            );
        }

        function openPopup(card) {
            if (!card) return;

            if (popupHideTimer) {
                clearTimeout(popupHideTimer);
                popupHideTimer = null;
            }

            if (modalOpen && activePopupCard === card) {
                positionPopup(card);
                return;
            }

            const switchingCard = modalOpen && activePopupCard && activePopupCard !== card;

            popupCategory.textContent = card.dataset.popupCategory || 'LIVE-ACTION';
            popupRating.textContent = `★ ${card.dataset.popupRating || '—'}`;
            popupTitle.textContent = card.dataset.popupTitle || '';
            popupDuration.textContent = card.dataset.popupDuration || '—';
            popupEpisodeLabel.textContent = card.dataset.popupEpisodeLabel || 'EP.';
            popupNumber.textContent = card.dataset.popupNumber || '01';
            popupQuality.textContent = card.dataset.popupQuality || 'FULL HD';
            const rawDescription = (card.dataset.popupDescription || 'Detalii despre serie vor fi disponibile în curând.').trim();
            const cleanDescription = rawDescription.replace(/[.\s…]+$/, '');
            popupDescription.textContent = `${cleanDescription}…`;
            popupPosted.textContent = postedDate;
            popupGenreFooter.textContent = card.dataset.genre || card.dataset.popupType || '—';

            popupWatch.dataset.url = card.dataset.popupUrl || 'link-read.html';
            popupWatch.setAttribute(
                'aria-label',
                `Vezi seria ${card.dataset.popupTitle || ''}`
            );

            if (activePopupCard && activePopupCard !== card) {
                activePopupCard.setAttribute('aria-expanded', 'false');
            }
            activePopupCard = card;
            card.setAttribute('aria-expanded', 'true');
            popup.hidden = false;

            /* Dacă cursorul trece direct pe alt card, nu mai închidem și
               redeschidem fereastra: schimbăm instant conținutul și poziția. */
            if (switchingCard) {
                popup.classList.remove('is-measuring');
                popup.classList.add('is-open');
                positionPopup(card);
                modalOpen = true;
                stopAuto();
                return;
            }

            /* La prima deschidere îl măsurăm și îl ancorăm lângă card. */
            popup.classList.add('is-measuring');
            requestAnimationFrame(() => {
                positionPopup(card);
                popup.classList.remove('is-measuring');
                popup.classList.add('is-open');
            });

            modalOpen = true;
            stopAuto();
        }

        function closePopup({ restoreFocus = false } = {}) {
            if (!modalOpen) return;

            const triggerCard = activePopupCard;
            if (triggerCard) triggerCard.setAttribute('aria-expanded', 'false');
            popup.classList.remove('is-open');
            modalOpen = false;
            activePopupCard = null;

            if (restoreFocus) {
                triggerCard?.focus({ preventScroll: true });
            }

            if (popupHideTimer) {
                clearTimeout(popupHideTimer);
            }

            popupHideTimer = window.setTimeout(() => {
                /* Dacă între timp cursorul a ajuns pe alt card și popup-ul
                   s-a redeschis, timeout-ul vechi nu mai are voie să-l ascundă. */
                if (modalOpen) return;

                popup.hidden = true;
                popupPanel.removeAttribute('style');
                popupPanel.removeAttribute('data-side');
                popupHideTimer = null;
            }, 150);

            startAuto();
        }

        popupPanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        popupWatch.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const url = popupWatch.dataset.url;
            if (!url) return;

            window.location.href = url;
        });

        /* Popover-ul rămâne lipit de card prin managerul comun de viewport. */
        const popupTracking = window.AniVortexPopup.bindViewportTracking(() => {
            if (modalOpen && activePopupCard) positionPopup(activePopupCard);
        });
        const schedulePopupPosition = popupTracking.schedule;

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOpen) {
                closePopup({ restoreFocus: true });
            }
        });

        container.addEventListener('keydown', (event) => {
            if (!(event.target instanceof Element) || event.target.closest('button')) return;
            const card = event.target.closest('.card');
            if (!card || !container.contains(card)) return;

            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                event.stopPropagation();
                stopAuto();
                event.key === 'ArrowLeft' ? prevCard() : nextCard();
                window.setTimeout(startAuto, 850);
                return;
            }

            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            openPopup(card);
        });

        let hoverCloseTimer = null;

        function cancelHoverClose() {
            if (hoverCloseTimer) {
                clearTimeout(hoverCloseTimer);
                hoverCloseTimer = null;
            }
        }

        function scheduleHoverClose(delay = 140) {
            cancelHoverClose();
            hoverCloseTimer = window.setTimeout(() => {
                const cardHovered =
                    activePopupCard &&
                    typeof activePopupCard.matches === 'function' &&
                    activePopupCard.matches(':hover');

                if (cardHovered || popupPanel.matches(':hover')) return;
                closePopup();
            }, delay);
        }

        /* HOVER pe CARD => popup-ul există numai cât cursorul este pe card.
           Zonele goale din stânga/dreapta și dintre carduri nu îl declanșează. */
        container.addEventListener('pointerover', (event) => {
            if (!(event.target instanceof Element)) return;

            const card = event.target.closest('.card');
            if (!card || !container.contains(card)) return;

            cancelHoverClose();

            if (activePopupCard !== card) {
                openPopup(card);
            }
        });

        container.addEventListener('pointerout', (event) => {
            if (!(event.target instanceof Element)) return;

            const card = event.target.closest('.card');
            if (!card || card !== activePopupCard) return;

            const related = event.relatedTarget;
            if (related instanceof Node && card.contains(related)) return;

            /* Dacă intrăm direct pe alt card, nu ascundem popup-ul între ele.
               pointerover pe noul card îi schimbă imediat conținutul. */
            if (related instanceof Element) {
                const nextCard = related.closest('.card');
                if (nextCard && nextCard !== card && container.contains(nextCard)) {
                    return;
                }
            }

            /* În orice altă zonă, popup-ul dispare. */
            cancelHoverClose();
            closePopup();
        });

        /* Pe touch păstrăm click-ul ca fallback, numai pe card. */
        container.addEventListener('click', (event) => {
            if (pointerMoved || !(event.target instanceof Element)) return;
            if (event.target.closest('button, .card-back-btn')) return;

            const card = event.target.closest('.card');
            if (!card || !container.contains(card)) return;

            if (window.matchMedia('(hover: none)').matches) {
                event.preventDefault();
                event.stopPropagation();
                openPopup(card);
            }
        });

        function cardAt(index) {
            return cardAtSource(index);
        }

        function resetCardState(card) {
            card.classList.remove(
                'flipped',
                'av-exit-left',
                'av-exit-right',
                'av-enter-left',
                'av-enter-right'
            );
            card.setAttribute('aria-expanded', 'false');
            card.removeAttribute('style');
        }

        function mountInitial() {
            track.replaceChildren();
            visibleCards = [];

            for (let pos = 0; pos < VISIBLE_COUNT; pos++) {
                const card = cardAt(startIndex + pos);
                resetCardState(card);
                card.dataset.pos = String(pos);
                visibleCards.push(card);
                track.appendChild(card);
            }
        }

        function nextCard() {
            if (busy) return;
            busy = true;
            pointerMoved = false;

            const outgoing = visibleCards.shift();
            outgoing.classList.add('av-exit-left');

            visibleCards.forEach((card, pos) => {
                card.dataset.pos = String(pos);
            });

            const incoming = cardAt(startIndex + VISIBLE_COUNT);
            resetCardState(incoming);
            incoming.dataset.pos = '7';
            incoming.classList.add('av-enter-right');
            track.appendChild(incoming);
            visibleCards.push(incoming);

            // Force the initial off-screen state before animating into slot 7.
            incoming.getBoundingClientRect();
            requestAnimationFrame(() => incoming.classList.remove('av-enter-right'));

            window.setTimeout(() => {
                outgoing.remove();
                resetCardState(outgoing);
                startIndex = (startIndex + 1) % total;
                busy = false;
            }, ANIMATION_MS);
        }

        function prevCard() {
            if (busy) return;
            busy = true;
            pointerMoved = false;

            const outgoing = visibleCards.pop();
            outgoing.classList.add('av-exit-right');

            visibleCards.forEach((card, index) => {
                card.dataset.pos = String(index + 1);
            });

            const newStart = (startIndex - 1 + total) % total;
            const incoming = cardAt(newStart);
            resetCardState(incoming);
            incoming.dataset.pos = '0';
            incoming.classList.add('av-enter-left');
            track.appendChild(incoming);
            visibleCards.unshift(incoming);

            incoming.getBoundingClientRect();
            requestAnimationFrame(() => incoming.classList.remove('av-enter-left'));

            window.setTimeout(() => {
                outgoing.remove();
                resetCardState(outgoing);
                startIndex = newStart;
                busy = false;
            }, ANIMATION_MS);
        }

        function hasFlippedCard() {
            return isPopupOpen();
        }

        const autoplay = window.AniVortexCarousel.createAutoplayController({
            root: container,
            interval: AUTO_BASE_MS + rowIndex * 260,
            tick: nextCard,
            canStart: () => !isPopupOpen() && !container.matches(':hover') && !container.contains(document.activeElement),
        });

        function stopAuto() {
            autoplay.stop();
        }

        function startAuto() {
            autoplay.start();
        }

        window.AniVortexCarousel.bindInteractionPause(container, autoplay, {
            canResume: () => !isPopupOpen(),
        });

        container.addEventListener('wheel', (event) => {
            /* Roata controlează caruselul numai în zona reală a track-ului.
               În extremitățile goale stânga/dreapta lăsăm scroll-ul paginii normal. */
            if (!(event.target instanceof Element)) return;

            const trackWrapper = event.target.closest('.carousel-track-wrapper');
            if (!trackWrapper || !container.contains(trackWrapper)) return;

            if (hasFlippedCard()) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

            event.preventDefault();
            stopAuto();
            event.deltaY > 0 ? nextCard() : prevCard();
            window.setTimeout(startAuto, 850);
        }, { passive: false });

        container.addEventListener('pointerdown', (event) => {
            if (hasFlippedCard()) {
                pointerStartX = null;
                return;
            }

            pointerStartX = event.clientX;
            pointerMoved = false;
            pointerCaptured = false;
            stopAuto();

            /* IMPORTANT:
               Nu facem setPointerCapture aici.
               Un tap/click simplu trebuie să rămână cu target-ul pe card. */
        });

        container.addEventListener('pointermove', (event) => {
            if (pointerStartX === null) return;

            const dx = event.clientX - pointerStartX;

            if (Math.abs(dx) > 10) {
                pointerMoved = true;

                /* Capturăm pointerul doar când este clar că utilizatorul
                   face swipe/drag, nu la un click normal. */
                if (!pointerCaptured) {
                    try {
                        container.setPointerCapture(event.pointerId);
                        pointerCaptured = true;
                    } catch (_) {}
                }
            }
        });

        container.addEventListener('pointerup', (event) => {
            if (pointerStartX !== null) {
                const dx = event.clientX - pointerStartX;

                if (Math.abs(dx) > 42) {
                    dx < 0 ? nextCard() : prevCard();
                }
            }

            if (pointerCaptured) {
                try {
                    container.releasePointerCapture(event.pointerId);
                } catch (_) {}
            }

            pointerStartX = null;
            pointerCaptured = false;

            /* Dacă a fost doar click, event-ul click care urmează va
               întoarce cardul și va opri auto-scroll-ul. */
            if (pointerMoved) {
                window.setTimeout(() => {
                    pointerMoved = false;
                    startAuto();
                }, 0);
            }
        });

        container.addEventListener('pointercancel', (event) => {
            if (pointerCaptured) {
                try {
                    container.releasePointerCapture(event.pointerId);
                } catch (_) {}
            }

            pointerStartX = null;
            pointerMoved = false;
            pointerCaptured = false;
            startAuto();
        });

        mountInitial();
        window.setTimeout(startAuto, 1400 + rowIndex * 220);
    });
});