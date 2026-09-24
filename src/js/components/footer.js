document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("avFooter");
  const word = footer?.querySelector(".avf-outline-word");

  if (!footer || !word) return;

  const letters = "AniVortex".split("");

  // Prima apariție în footer: literele se plimbă ~8 secunde.
  const FIRST_ROAM_DURATION = 8000;

  // După ce s-a format AniVortex, stă exact 15 secunde.
  // Apoi literele pleacă din nou la plimbare timp de 15 secunde.
  const HOLD_DURATION = 15000;
  const LOOP_ROAM_DURATION = 15000;
  const ASSEMBLE_DURATION = 2400;
  const EDGE_PADDING = 42;

  word.innerHTML = letters
    .map((letter) => `<span aria-hidden="true">${letter}</span>`)
    .join("");

  const spans = [...word.querySelectorAll("span")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let runToken = 0;
  let isVisible = false;
  let activeAnimations = [];
  let waitTimer = null;

  const randomBetween = (min, max) => {
    if (max <= min) return min;
    return min + Math.random() * (max - min);
  };

  const cancelAnimations = () => {
    activeAnimations.forEach((animation) => {
      try {
        animation.cancel();
      } catch (_) {}
    });
    activeAnimations = [];
  };

  const clearWaitTimer = () => {
    if (waitTimer !== null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  };

  const wait = (duration, token) =>
    new Promise((resolve) => {
      clearWaitTimer();
      waitTimer = setTimeout(() => {
        waitTimer = null;
        if (token === runToken) resolve();
      }, duration);
    });

  const waitForAnimation = (animation) =>
    animation.finished.catch(() => undefined);

  const resetToAssembled = () => {
    word.classList.remove("is-waiting", "is-roaming", "is-gathering");
    word.classList.add("is-assembled");

    spans.forEach((span) => {
      span.style.transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)";
      span.style.opacity = "0.95";
      span.style.filter = "none";
    });
  };

  const getTravelBounds = (span) => {
    const footerRect = footer.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    return {
      minX: footerRect.left + EDGE_PADDING - spanRect.left,
      maxX: footerRect.right - EDGE_PADDING - spanRect.right,
      minY: footerRect.top + EDGE_PADDING - spanRect.top,
      maxY: footerRect.bottom - EDGE_PADDING - spanRect.bottom
    };
  };

  const makeRoamPath = (span, index, duration, startFromAssembled) => {
    const bounds = getTravelBounds(span);
    const points = [];
    const waypointCount = duration >= 12000 ? 11 : 8;

    // La ciclurile următoare, literele pleacă lin chiar din cuvântul AniVortex,
    // imediat după cele 15 secunde de pauză. Fără salt brusc.
    if (startFromAssembled) {
      points.push({
        offset: 0,
        transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)",
        opacity: "0.95",
        filter: "none"
      });
    }

    const startIndex = startFromAssembled ? 1 : 0;

    for (let i = startIndex; i < waypointCount; i += 1) {
      const progress = i / (waypointCount - 1);
      const x = randomBetween(bounds.minX, bounds.maxX);
      const y = randomBetween(bounds.minY, bounds.maxY);
      const rotation = randomBetween(-28, 28);
      const scale = randomBetween(0.84, 1.07);
      const opacity = randomBetween(0.20, 0.48);

      points.push({
        offset: progress,
        transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
        opacity: opacity.toFixed(3),
        filter: "none"
      });
    }

    // La prima intrare nu vrem ca literele să apară prea puternic din prima.
    if (!startFromAssembled && points[0]) points[0].opacity = "0.18";
    if (!startFromAssembled && points[1]) {
      points[1].opacity = Math.min(0.46, 0.28 + index * 0.012).toFixed(3);
    }

    return points;
  };

  const roamAndAssemble = async (roamDuration, token, startFromAssembled = false) => {
    if (!isVisible || token !== runToken) return false;

    cancelAnimations();
    word.classList.remove("is-waiting", "is-assembled", "is-gathering");
    word.classList.add("is-roaming");

    spans.forEach((span) => {
      span.style.removeProperty("transform");
      span.style.removeProperty("opacity");
      span.style.removeProperty("filter");
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!isVisible || token !== runToken) return false;

    const roamPaths = spans.map((span, index) =>
      makeRoamPath(span, index, roamDuration, startFromAssembled)
    );

    const roamAnimations = spans.map((span, index) => {
      const animation = span.animate(roamPaths[index], {
        duration: roamDuration,
        easing: "linear",
        fill: "forwards"
      });
      activeAnimations.push(animation);
      return animation;
    });

    await Promise.all(roamAnimations.map(waitForAnimation));
    if (!isVisible || token !== runToken) return false;

    word.classList.remove("is-roaming");
    word.classList.add("is-gathering");

    // Unire simplă: fără overshoot, fără blur, fără glow sau flash.
    const assembleAnimations = spans.map((span, index) => {
      const lastPoint = roamPaths[index][roamPaths[index].length - 1];

      const animation = span.animate(
        [
          {
            transform: lastPoint.transform,
            opacity: lastPoint.opacity,
            filter: "none"
          },
          {
            transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)",
            opacity: "0.95",
            filter: "none"
          }
        ],
        {
          duration: ASSEMBLE_DURATION,
          easing: "cubic-bezier(.22, .8, .2, 1)",
          fill: "forwards"
        }
      );

      activeAnimations.push(animation);
      return animation;
    });

    await Promise.all(assembleAnimations.map(waitForAnimation));
    if (!isVisible || token !== runToken) return false;

    resetToAssembled();
    cancelAnimations();
    return true;
  };

  const startLoop = async () => {
    runToken += 1;
    const token = runToken;

    cancelAnimations();
    clearWaitTimer();
    word.classList.remove("is-waiting");

    // 1) Prima intrare în footer: ~8 secunde de mișcare, apoi se formează AniVortex.
    const firstCycleCompleted = await roamAndAssemble(
      FIRST_ROAM_DURATION,
      token,
      false
    );

    if (!firstCycleCompleted || token !== runToken || !isVisible) return;

    // 2) Repetare permanentă:
    //    AniVortex stă unit EXACT 15 secunde -> literele pleacă lin ->
    //    se plimbă 15 secunde -> se unesc fără strălucire -> iar 15 secunde pauză.
    while (token === runToken && isVisible) {
      await wait(HOLD_DURATION, token);
      if (token !== runToken || !isVisible) return;

      const completed = await roamAndAssemble(
        LOOP_ROAM_DURATION,
        token,
        true
      );

      if (!completed || token !== runToken || !isVisible) return;
    }
  };

  const stopLoop = () => {
    isVisible = false;
    runToken += 1;
    clearWaitTimer();
    cancelAnimations();
    resetToAssembled();
  };

  if (reduceMotion) {
    resetToAssembled();
    return;
  }

  word.classList.add("is-waiting");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const visibleEnough = entry.isIntersecting && entry.intersectionRatio >= 0.18;

        if (visibleEnough && !isVisible) {
          isVisible = true;
          startLoop();
        } else if (!entry.isIntersecting && isVisible) {
          stopLoop();
        }
      }
    },
    { threshold: [0, 0.18, 0.35] }
  );

  observer.observe(footer);

  footer.addEventListener("dblclick", (event) => {
    if (event.target.closest("a, button")) return;
    isVisible = true;
    startLoop();
  });
});
