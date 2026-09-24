document.addEventListener("DOMContentLoaded", () => {
      const bannerSlider = document.querySelector(".banner-slider");
      const banners = document.querySelectorAll(".banner-slider .banner");
      const prevBtn = document.querySelector(".slider-nav .prev");
      const nextBtn = document.querySelector(".slider-nav .next");
      const dots = document.querySelectorAll(".slider-nav .nav-dot");
 
      let currentIndex = 0;

      if (!bannerSlider || !banners.length) return;

      prevBtn?.setAttribute("aria-label", "Bannerul anterior");
      nextBtn?.setAttribute("aria-label", "Bannerul următor");

      dots.forEach((dot, index) => {
        dot.setAttribute("aria-label", `Afișează bannerul ${index + 1}`);
        dot.setAttribute("aria-pressed", "false");
      });
 
      function showBanner(index) {
        banners.forEach((banner, i) => {
          banner.style.display = i === index ? "block" : "none";
          banner.classList.toggle("active", i === index);
          banner.setAttribute("aria-hidden", String(i !== index));
        });
 
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
          dot.setAttribute("aria-pressed", String(i === index));
        });
      }
 
      function nextBanner() {
        currentIndex++;
        if (currentIndex >= banners.length) {
          currentIndex = 0;
        }
        showBanner(currentIndex);
      }
 
      function prevBanner() {
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = banners.length - 1;
        }
        showBanner(currentIndex);
      }
 
      const autoplay = window.AniVortexCarousel.createAutoplayController({
        root: bannerSlider,
        interval: 40000,
        tick: nextBanner,
        canStart: () => !bannerSlider.matches(":hover") && !bannerSlider.contains(document.activeElement),
      });

      function stopAutoSlide() {
        autoplay.stop();
      }

      function startAutoSlide() {
        autoplay.start();
      }
 
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          nextBanner();
          startAutoSlide();
        });
      }
 
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          prevBanner();
          startAutoSlide();
        });
      }
 
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          currentIndex = index;
          showBanner(currentIndex);
          startAutoSlide();
        });
      });

      window.AniVortexCarousel.bindInteractionPause(bannerSlider, autoplay);
      window.AniVortexCarousel.bindSwipe(bannerSlider, {
        onStart: stopAutoSlide,
        onNext: () => {
          nextBanner();
          startAutoSlide();
        },
        onPrev: () => {
          prevBanner();
          startAutoSlide();
        },
      });
 
      showBanner(currentIndex);
      startAutoSlide();
    });
