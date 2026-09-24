document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");
  const filterPanel = document.getElementById("filterPanel");
  const openFilterBtn = document.getElementById("openFilterBtn");
  const closeFilterBtn = document.getElementById("closeFilterBtn");

  if (!hamburger || !sidebar || !sidebarOverlay || !filterPanel) {
    return;
  }

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  let sidebarReturnFocus = hamburger;
  let filterReturnFocus = openFilterBtn;
  let previousBodyOverflow = "";

  function setPanelState(panel, isOpen) {
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.inert = !isOpen;
  }

  function getFocusableElements(panel) {
    return [...panel.querySelectorAll(focusableSelector)]
      .filter((element) => element.getClientRects().length > 0);
  }

  function focusFirstControl(panel) {
    getFocusableElements(panel)[0]?.focus();
  }

  function lockPageScroll() {
    if (!sidebar.classList.contains("active") && !filterPanel.classList.contains("active")) {
      previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";
  }

  function unlockPageScroll() {
    document.body.style.overflow = previousBodyOverflow;
  }

  function openSidebar() {
    sidebarReturnFocus = hamburger;

    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Închide meniul");
    setPanelState(sidebar, true);
    lockPageScroll();
    focusFirstControl(sidebar);
  }

  function closeFilterPanel({ restoreFocus = true } = {}) {
    const wasOpen = filterPanel.classList.contains("active");

    filterPanel.classList.remove("active");
    openFilterBtn?.setAttribute("aria-expanded", "false");
    setPanelState(filterPanel, false);

    if (sidebar.classList.contains("active")) {
      setPanelState(sidebar, true);
    } else {
      sidebarOverlay.classList.remove("active");
      unlockPageScroll();
    }

    if (wasOpen && restoreFocus) {
      const target = filterReturnFocus?.isConnected ? filterReturnFocus : openFilterBtn;
      target?.focus();
    }
  }

  function closeSidebar({ restoreFocus = true } = {}) {
    const wasOpen = sidebar.classList.contains("active") || filterPanel.classList.contains("active");

    closeFilterPanel({ restoreFocus: false });
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Deschide meniul");
    setPanelState(sidebar, false);
    unlockPageScroll();

    if (wasOpen && restoreFocus) {
      const target = sidebarReturnFocus?.isConnected ? sidebarReturnFocus : hamburger;
      target.focus();
    }
  }

  function openFilterPanel() {
    filterReturnFocus = openFilterBtn;

    filterPanel.classList.add("active");
    sidebarOverlay.classList.add("active");
    openFilterBtn?.setAttribute("aria-expanded", "true");
    setPanelState(sidebar, false);
    setPanelState(filterPanel, true);
    lockPageScroll();
    focusFirstControl(filterPanel);
  }

  hamburger.addEventListener("click", (event) => {
    event.stopPropagation();

    if (sidebar.classList.contains("active")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarClose?.addEventListener("click", () => closeSidebar());
  sidebarOverlay.addEventListener("click", () => closeSidebar());
  openFilterBtn?.addEventListener("click", openFilterPanel);
  closeFilterBtn?.addEventListener("click", () => closeFilterPanel());

  const updateHeaderState = () => {
    header?.classList.toggle("scrolled", window.scrollY > 50);
  };

  const scheduleHeaderState = (window.AniVortexPerf?.rafThrottle || (callback => callback))(
    updateHeaderState
  );
  window.addEventListener("scroll", scheduleHeaderState, { passive: true });

  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");

    const toggleDropdown = () => {
      const parent = toggle.parentElement;
      const isOpen = parent.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", toggleDropdown);
  });

  document.querySelectorAll(".genre-button").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("active");
      button.setAttribute("aria-pressed", String(isActive));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (filterPanel.classList.contains("active")) {
        closeFilterPanel();
      } else if (sidebar.classList.contains("active")) {
        closeSidebar();
      }
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const activePanel = filterPanel.classList.contains("active")
      ? filterPanel
      : sidebar.classList.contains("active")
        ? sidebar
        : null;

    if (!activePanel) {
      return;
    }

    const focusable = getFocusableElements(activePanel);
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      event.preventDefault();
      activePanel.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
