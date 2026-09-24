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

