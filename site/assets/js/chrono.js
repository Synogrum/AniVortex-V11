document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".chronologie-container");
    if (!root || root.dataset.chronoEnhanced === "true") return;

    const yearList = root.querySelector(".ani");
    const yearsViewport = root.querySelector(".timp");
    const leftButton = root.querySelector("#left");
    const rightButton = root.querySelector("#right");
    const title = root.querySelector(".titlu");
    const shareText = root.querySelector(".share-text");
    const shareButtons = root.querySelector(".share-buttons");
    const slider = root.querySelector(".slider-container");

    if (!yearList || !yearsViewport || !leftButton || !rightButton || !title || !shareText || !shareButtons || !slider) return;

    const minimumYear = 1917;
    const maximumYear = 2026;
    const pageSize = 10;
    const years = Array.from(
        { length: maximumYear - minimumYear + 1 },
        (_, index) => minimumYear + index
    );

    let pageStart = Math.max(0, years.length - pageSize);
    let selectedYear = maximumYear;

    function enhanceContent() {
        root.dataset.chronoEnhanced = "true";
        root.classList.add("is-enhanced");
        root.setAttribute("aria-labelledby", "chrono-title");
        title.id = "chrono-title";
        title.setAttribute("role", "heading");
        title.setAttribute("aria-level", "2");
        title.innerHTML = `
            <span class="chrono-eyebrow">Arhiva AniVortex</span>
            <strong class="chrono-title-main">Explorează anime după an</strong>
            <span class="chrono-title-subtitle">Parcurge cronologia și descoperă titlurile care au definit fiecare perioadă.</span>
        `;

        root.querySelectorAll(".personaj").forEach((image) => {
            image.alt = "";
            image.setAttribute("aria-hidden", "true");
        });

        leftButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"></path></svg>';
        rightButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"></path></svg>';
        leftButton.type = "button";
        rightButton.type = "button";
        leftButton.setAttribute("aria-label", "Arată anii anteriori");
        rightButton.setAttribute("aria-label", "Arată anii următori");

        yearsViewport.tabIndex = -1;
        yearList.setAttribute("role", "group");
        yearList.setAttribute("aria-label", "Ani disponibili");

        const range = document.createElement("div");
        range.className = "chrono-range";
        range.setAttribute("aria-live", "polite");
        range.innerHTML = '<span aria-hidden="true"></span><output id="chrono-range-output"></output><span aria-hidden="true"></span>';
        slider.insertAdjacentElement("afterend", range);

        shareText.innerHTML = `
            <span class="chrono-share-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.3 10.9 7.4-4.5M8.3 13.1l7.4 4.5"></path></svg>
            </span>
            <span class="chrono-share-copy"><strong>Îți place AniVortex?</strong><span>Trimite cronologia unui prieten și ajută comunitatea să crească.</span></span>
        `;

        const sharePanel = document.createElement("div");
        sharePanel.className = "chrono-share-panel";
        shareText.insertAdjacentElement("beforebegin", sharePanel);
        sharePanel.append(shareText, shareButtons);

        const platformNames = {
            facebook: "Facebook",
            twitter: "X",
            messenger: "Messenger",
            whatsapp: "WhatsApp",
            tiktok: "TikTok",
            instagram: "Instagram"
        };

        const socialLabel = document.createElement("span");
        socialLabel.className = "chrono-socials-label";
        socialLabel.setAttribute("aria-hidden", "true");
        socialLabel.textContent = "Distribuie";
        shareButtons.prepend(socialLabel);

        shareButtons.querySelectorAll("a").forEach((link) => {
            const platformClass = Object.keys(platformNames).find((name) => link.classList.contains(name));
            const platform = platformNames[platformClass] || "rețeaua selectată";
            const image = link.querySelector("img");

            link.setAttribute("aria-label", `Distribuie pe ${platform}`);
            link.title = platform;
            link.rel = "noopener noreferrer";

            if (image) {
                image.alt = "";
                image.setAttribute("aria-hidden", "true");
                link.replaceChildren(image);
            }

            const hiddenLabel = document.createElement("span");
            hiddenLabel.className = "share-label";
            hiddenLabel.textContent = platform;
            link.appendChild(hiddenLabel);
        });
    }

    function visibleYears() {
        return years.slice(pageStart, pageStart + pageSize);
    }

    function updateControls() {
        leftButton.disabled = pageStart === 0;
        rightButton.disabled = pageStart + pageSize >= years.length;
    }

    function selectYear(year) {
        selectedYear = year;
        yearList.querySelectorAll(".chrono-year").forEach((button) => {
            const isSelected = Number(button.dataset.year) === selectedYear;
            button.classList.toggle("is-selected", isSelected);
            if (isSelected) {
                button.setAttribute("aria-current", "date");
            } else {
                button.removeAttribute("aria-current");
            }
        });
    }

    function revealYear(year, focusYear) {
        const button = yearList.querySelector(`[data-year="${year}"]`);
        if (!button) return;

        requestAnimationFrame(() => {
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const targetLeft = button.offsetLeft - (yearsViewport.clientWidth - button.offsetWidth) / 2;
            yearsViewport.scrollTo({
                left: Math.max(0, targetLeft),
                behavior: focusYear && !reduceMotion ? "smooth" : "auto"
            });
            if (focusYear) button.focus({ preventScroll: true });
        });
    }

    function renderYears(focusYear = null) {
        const fragment = document.createDocumentFragment();
        const currentYears = visibleYears();

        currentYears.forEach((year) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "chrono-year";
            button.dataset.year = String(year);
            button.setAttribute("aria-label", `Explorează anime din ${year}`);
            button.textContent = String(year);
            fragment.appendChild(button);
        });

        yearList.replaceChildren(fragment);
        root.querySelector("#chrono-range-output").textContent = `${currentYears[0]} — ${currentYears[currentYears.length - 1]}`;
        updateControls();
        selectYear(selectedYear);
        revealYear(focusYear ?? selectedYear, focusYear !== null);
    }

    function showPreviousYears() {
        pageStart = Math.max(0, pageStart - pageSize);
        const currentYears = visibleYears();
        selectedYear = currentYears[currentYears.length - 1];
        renderYears(selectedYear);
    }

    function showNextYears() {
        pageStart = Math.min(years.length - pageSize, pageStart + pageSize);
        const currentYears = visibleYears();
        selectedYear = currentYears[0];
        renderYears(selectedYear);
    }

    enhanceContent();
    renderYears();

    leftButton.addEventListener("click", showPreviousYears);
    rightButton.addEventListener("click", showNextYears);

    yearList.addEventListener("click", (event) => {
        const button = event.target.closest(".chrono-year");
        if (!button) return;
        const year = Number(button.dataset.year);
        selectYear(year);
        window.location.href = `ani/${year}.html`;
    });

    yearList.addEventListener("keydown", (event) => {
        const button = event.target.closest(".chrono-year");
        if (!button) return;

        const year = Number(button.dataset.year);
        let nextYear = year;

        if (event.key === "ArrowLeft") nextYear = Math.max(minimumYear, year - 1);
        if (event.key === "ArrowRight") nextYear = Math.min(maximumYear, year + 1);
        if (event.key === "Home") nextYear = minimumYear;
        if (event.key === "End") nextYear = maximumYear;
        if (nextYear === year) return;

        event.preventDefault();
        const currentYears = visibleYears();
        const firstVisibleYear = currentYears[0];
        const lastVisibleYear = currentYears[currentYears.length - 1];

        if (nextYear < firstVisibleYear || nextYear > lastVisibleYear) {
            pageStart = Math.min(
                Math.max(0, Math.floor((nextYear - minimumYear) / pageSize) * pageSize),
                years.length - pageSize
            );
            selectedYear = nextYear;
            renderYears(nextYear);
        } else {
            selectYear(nextYear);
            yearList.querySelector(`[data-year="${nextYear}"]`)?.focus();
        }
    });

    let resizeFrame = 0;
    const keepSelectedYearVisible = () => {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => revealYear(selectedYear, false));
    };

    window.addEventListener("resize", keepSelectedYearVisible);

    if ("ResizeObserver" in window) {
        const yearsResizeObserver = new ResizeObserver(keepSelectedYearVisible);
        yearsResizeObserver.observe(yearsViewport);
    }
});
