(() => {
  'use strict';

  if (window.AniVortexCarousel) return;

  function createAutoplayController(options = {}) {
    const root = options.root || null;
    const tick = options.tick;
    const interval = options.interval;
    const canStart = typeof options.canStart === 'function' ? options.canStart : () => true;

    if (typeof tick !== 'function') throw new TypeError('createAutoplayController requires tick');
    if (!(typeof interval === 'number' || typeof interval === 'function')) {
      throw new TypeError('createAutoplayController requires interval');
    }

    let timer = null;
    let destroyed = false;

    const getInterval = () => {
      const value = typeof interval === 'function' ? interval() : interval;
      return Math.max(250, Number(value) || 1000);
    };

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (destroyed) return false;
      if (!window.AniVortexPerf?.canRunAutoMotion?.()) return false;
      if (!canStart()) return false;
      timer = window.setInterval(tick, getInterval());
      return true;
    }

    function restart() {
      return start();
    }

    const unsubscribeMotion = window.AniVortexPerf?.onAutoMotionChange?.((canRun) => {
      if (canRun) start();
      else stop();
    }) || (() => {});

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      unsubscribeMotion();
    }

    return Object.freeze({
      start,
      stop,
      restart,
      destroy,
      isRunning: () => timer !== null,
      root,
    });
  }

  function bindInteractionPause(root, controller, options = {}) {
    if (!root || !controller) return () => {};
    const cleanups = [];
    const resume = () => {
      if (options.canResume && !options.canResume()) return;
      controller.start();
    };

    if (options.hover !== false) {
      const onEnter = () => controller.stop();
      const onLeave = () => {
        if (root.contains(document.activeElement)) return;
        resume();
      };
      root.addEventListener('mouseenter', onEnter);
      root.addEventListener('mouseleave', onLeave);
      cleanups.push(() => root.removeEventListener('mouseenter', onEnter));
      cleanups.push(() => root.removeEventListener('mouseleave', onLeave));
    }

    if (options.focus !== false) {
      const onFocusIn = () => controller.stop();
      const onFocusOut = (event) => {
        if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
        resume();
      };
      root.addEventListener('focusin', onFocusIn);
      root.addEventListener('focusout', onFocusOut);
      cleanups.push(() => root.removeEventListener('focusin', onFocusIn));
      cleanups.push(() => root.removeEventListener('focusout', onFocusOut));
    }

    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }


  function bindSwipe(root, options = {}) {
    if (!root) return () => {};
    const threshold = Math.max(20, Number(options.threshold) || 42);
    const interactiveSelector = options.ignoreSelector || 'button, a, input, textarea, select, [data-no-swipe]';
    let startX = null;
    let startY = null;
    let pointerId = null;
    let dragging = false;

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(interactiveSelector)) return;
      startX = event.clientX;
      startY = event.clientY;
      pointerId = event.pointerId;
      dragging = false;
      options.onStart?.();
    };

    const onPointerMove = (event) => {
      if (startX === null || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        dragging = true;
        try { root.setPointerCapture?.(event.pointerId); } catch (_) {}
      }
    };

    const finish = (event, cancelled = false) => {
      if (startX === null || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const horizontal = Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy);

      if (!cancelled && horizontal) {
        if (dx < 0) options.onNext?.(event);
        else options.onPrev?.(event);
      }

      if (dragging) {
        try { root.releasePointerCapture?.(event.pointerId); } catch (_) {}
      }
      startX = null;
      startY = null;
      pointerId = null;
      dragging = false;
      options.onEnd?.({ moved: !cancelled && horizontal });
    };

    const onPointerUp = (event) => finish(event, false);
    const onPointerCancel = (event) => finish(event, true);

    root.addEventListener('pointerdown', onPointerDown, { passive: true });
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerup', onPointerUp, { passive: true });
    root.addEventListener('pointercancel', onPointerCancel, { passive: true });

    return () => {
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerCancel);
    };
  }

  Object.defineProperty(window, 'AniVortexCarousel', {
    value: Object.freeze({ createAutoplayController, bindInteractionPause, bindSwipe }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
