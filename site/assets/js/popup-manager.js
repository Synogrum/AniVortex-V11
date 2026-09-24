(() => {
  'use strict';

  if (window.AniVortexPopup) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function rectOf(target) {
    if (!target) return null;
    if (typeof target.getBoundingClientRect === 'function') {
      return target.getBoundingClientRect();
    }
    if (typeof target === 'object' && Number.isFinite(target.left) && Number.isFinite(target.top)) {
      return target;
    }
    return null;
  }

  function popupSize(popup, options = {}) {
    const rect = options.popupRect || rectOf(popup) || {};
    const width = options.width ?? rect.width ?? popup?.offsetWidth ?? 0;
    const height = options.height ?? rect.height ?? popup?.offsetHeight ?? 0;
    return { width, height };
  }

  function chooseSide(anchor, popup, options = {}) {
    const anchorRect = options.anchorRect || rectOf(anchor);
    if (!anchorRect) return options.prefer === 'left' ? 'left' : 'right';

    const { width } = popupSize(popup, options);
    const safe = options.safe ?? 8;
    const rightGap = options.rightGap ?? options.gap ?? 12;
    const leftGap = options.leftGap ?? options.gap ?? 12;
    const viewportWidth = options.viewportWidth ?? window.innerWidth;
    const prefer = options.prefer === 'left' ? 'left' : 'right';

    const fitsRight = anchorRect.right + rightGap + width <= viewportWidth - safe;
    const fitsLeft = anchorRect.left - leftGap - width >= safe;

    if (prefer === 'right') {
      if (fitsRight) return 'right';
      if (options.fallback === 'left' || options.fallback === 'right') return options.fallback;
      if (fitsLeft) return 'left';
    } else {
      if (fitsLeft) return 'left';
      if (options.fallback === 'left' || options.fallback === 'right') return options.fallback;
      if (fitsRight) return 'right';
    }

    const spaceRight = viewportWidth - anchorRect.right - rightGap;
    const spaceLeft = anchorRect.left - leftGap;
    return spaceRight >= spaceLeft ? 'right' : 'left';
  }

  function placeAdjacent(popup, anchor, options = {}) {
    const anchorRect = options.anchorRect || rectOf(anchor);
    if (!popup || !anchorRect) return null;

    const verticalRect = options.verticalRect || anchorRect;
    const size = popupSize(popup, options);
    const safe = options.safe ?? 8;
    const viewportWidth = options.viewportWidth ?? window.innerWidth;
    const viewportHeight = options.viewportHeight ?? window.innerHeight;
    const rightGap = options.rightGap ?? options.gap ?? 12;
    const leftGap = options.leftGap ?? options.gap ?? 12;
    const side = options.side || chooseSide(anchorRect, popup, { ...options, anchorRect });

    let left = side === 'right'
      ? anchorRect.right + rightGap
      : anchorRect.left - size.width - leftGap;

    if (options.clampX !== false) {
      left = clamp(left, safe, Math.max(safe, viewportWidth - size.width - safe));
    }

    const vertical = options.vertical || 'top';
    const topOffset = options.topOffset ?? 0;
    let top;
    if (vertical === 'center') {
      top = verticalRect.top + (verticalRect.height - size.height) / 2 + topOffset;
    } else if (vertical === 'bottom') {
      top = verticalRect.bottom - size.height + topOffset;
    } else {
      top = verticalRect.top + topOffset;
    }

    if (options.clampY !== false) {
      top = clamp(top, safe, Math.max(safe, viewportHeight - size.height - safe));
    }

    if (options.apply !== false) {
      popup.style.position = options.position || 'fixed';
      popup.style.left = `${Math.round(left)}px`;
      popup.style.top = `${Math.round(top)}px`;
      if (options.writeSide !== false) popup.dataset.side = side;
    }

    return { left, top, side, width: size.width, height: size.height, anchorRect, verticalRect };
  }

  function createPositionScheduler(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('createPositionScheduler requires a function');
    }
    const throttle = window.AniVortexPerf?.rafThrottle || ((fn) => fn);
    return throttle(callback);
  }

  function bindViewportTracking(callback, options = {}) {
    const scheduler = options.throttle === false ? callback : createPositionScheduler(callback);
    const cleanups = [];

    if (options.resize !== false) {
      window.addEventListener('resize', scheduler, { passive: true });
      cleanups.push(() => window.removeEventListener('resize', scheduler));
    }

    if (options.scroll !== false) {
      const target = options.scrollTarget || document;
      const capture = options.captureScroll !== false;
      target.addEventListener('scroll', scheduler, { passive: true, capture });
      cleanups.push(() => target.removeEventListener('scroll', scheduler, capture));
    }

    if (options.wheel) {
      const target = options.wheelTarget || document;
      target.addEventListener('wheel', scheduler, { passive: true });
      cleanups.push(() => target.removeEventListener('wheel', scheduler));
    }

    return {
      schedule: scheduler,
      destroy() {
        cleanups.splice(0).forEach((cleanup) => cleanup());
      },
    };
  }

  Object.defineProperty(window, 'AniVortexPopup', {
    value: Object.freeze({ chooseSide, placeAdjacent, createPositionScheduler, bindViewportTracking }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
