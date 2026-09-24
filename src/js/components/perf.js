(() => {
  'use strict';

  if (window.AniVortexPerf) return;

  const raf = window.requestAnimationFrame.bind(window);

  function rafThrottle(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('rafThrottle requires a function');
    }

    let frameId = 0;
    let latestArgs = [];
    let latestThis = null;

    return function throttledOnAnimationFrame(...args) {
      latestArgs = args;
      latestThis = this;
      if (frameId) return;

      frameId = raf(() => {
        frameId = 0;
        const callArgs = latestArgs;
        const callThis = latestThis;
        latestArgs = [];
        latestThis = null;
        callback.apply(callThis, callArgs);
      });
    };
  }

  const reducedMotionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function canRunAutoMotion() {
    const doc = window.document;
    return !(doc && doc.hidden) && !(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function onAutoMotionChange(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('onAutoMotionChange requires a function');
    }

    const doc = window.document;
    const handler = () => callback(canRunAutoMotion());

    doc?.addEventListener?.('visibilitychange', handler, { passive: true });
    reducedMotionQuery?.addEventListener?.('change', handler);

    return function unsubscribeAutoMotionChange() {
      doc?.removeEventListener?.('visibilitychange', handler);
      reducedMotionQuery?.removeEventListener?.('change', handler);
    };
  }



  function manageTopMotion() {
    const topRegion = document.querySelector('.page');
    const body = document.body;
    if (!topRegion || !body) return;

    const setActive = (active) => body.classList.toggle('av-top-motion-active', Boolean(active));

    if (typeof IntersectionObserver !== 'function') {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setActive(Boolean(entry && entry.isIntersecting));
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0 });

    observer.observe(topRegion);
  }

  function pauseOffscreenMotion() {
    const regions = document.querySelectorAll('.trending-master-container, .comentarii-section, .main-container, .hot-news-section, .chronologie-container, .av-entertainment-shell, .av-footer');
    if (!regions.length) return;

    if (typeof IntersectionObserver !== 'function') {
      regions.forEach((region) => region.classList.add('av-motion-active'));
      return;
    }

    const activationRatio = 0.15;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const active = entry.isIntersecting && entry.intersectionRatio >= activationRatio;
        entry.target.classList.toggle('av-motion-active', active);
        entry.target.classList.toggle('av-motion-paused', !active);
      }
    }, { rootMargin: '0px', threshold: [0, activationRatio, 0.35] });

    regions.forEach((region) => observer.observe(region));
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { manageTopMotion(); pauseOffscreenMotion(); }, { once: true });
    else { manageTopMotion(); pauseOffscreenMotion(); }
  }

  Object.defineProperty(window, 'AniVortexPerf', {
    value: Object.freeze({ rafThrottle, canRunAutoMotion, onAutoMotionChange }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
