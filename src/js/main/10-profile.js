/* =====================================================
   Reactii pentru noul panou Stirile AniVortex
   ===================================================== */
function initAniVortexNewsReactions() {
  const panel = document.querySelector('.av-news-panel');
  if (!panel || panel.dataset.reactionsReady === 'true') return;

  panel.dataset.reactionsReady = 'true';

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-news-reaction]');
    if (!button || !panel.contains(button)) return;

    const willActivate = !button.classList.contains('is-active');

    panel.querySelectorAll('[data-news-reaction]').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });

    button.classList.toggle('is-active', willActivate);
    button.setAttribute('aria-pressed', String(willActivate));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAniVortexNewsReactions);
} else {
  initAniVortexNewsReactions();
}

/* Activitate staff: maximum 10 caractere vizibile pentru nume. */
function formatStaffActivityNames() {
  document.querySelectorAll('.staff-activity-panel .staff-nm').forEach((nameElement) => {
    const fullName = nameElement.dataset.fullName || nameElement.textContent.trim();
    const characters = Array.from(fullName);

    nameElement.dataset.fullName = fullName;
    nameElement.title = fullName;
    nameElement.setAttribute('aria-label', fullName);
    nameElement.textContent = characters.length > 10
      ? `${characters.slice(0, 10).join('')}...`
      : fullName;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', formatStaffActivityNames);
} else {
  formatStaffActivityNames();
}

/* =====================================================================
   LOGIN CONTENT V2 — INTERACȚIUNI
   ===================================================================== */
function toggleAniVortexNotifications(event) {
  event?.stopPropagation();
  const profile = document.querySelector('.av-profile-v2');
  const button = profile?.querySelector('#avProfileNotifications');
  const menu = profile?.querySelector('#avProfileNotificationMenu');
  const statusButton = profile?.querySelector('#avProfileStatus');
  const statusMenu = profile?.querySelector('#avProfileStatusMenu');
  if (!button || !menu) return;

  const willOpen = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(willOpen));
  menu.setAttribute('aria-hidden', String(!willOpen));
  menu.classList.toggle('is-open', willOpen);

  if (statusButton && statusMenu) {
    statusButton.setAttribute('aria-expanded', 'false');
    statusMenu.setAttribute('aria-hidden', 'true');
    statusMenu.classList.remove('is-open');
  }
}

function initAniVortexProfileV2() {
  const profile = document.querySelector('.av-profile-v2');
  if (!profile || profile.dataset.initialized === 'true') return;
  profile.dataset.initialized = 'true';

  const toast = profile.querySelector('.av-profile-toast');
  const statusButton = profile.querySelector('#avProfileStatus');
  const statusMenu = profile.querySelector('#avProfileStatusMenu');
  const statusChoices = statusMenu?.querySelectorAll('[data-av-status]') || [];
  const notificationButton = profile.querySelector('#avProfileNotifications');
  const notificationMenu = profile.querySelector('#avProfileNotificationMenu');
  const notificationBadge = profile.querySelector('.av-profile-notification-badge');
  let toastTimer;

  const showProfileToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 1800);
  };

  const actionMessages = {
    'profile-settings': 'Pagina pentru setările profilului va fi adăugată ulterior.',
    'faction-settings': 'Pagina pentru setările facțiunii va fi adăugată ulterior.',
    logout: 'Conectează aici funcția reală de deconectare.'
  };

  profile.querySelectorAll('[data-av-profile-action]').forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.dataset.avProfileAction;
      const destination = control.dataset.avProfileHref;
      showProfileToast(actionMessages[action] || 'Acțiune selectată.');

      profile.dispatchEvent(new CustomEvent('anivortex:profile-action', {
        bubbles: true,
        detail: { action }
      }));

      if (destination) {
        window.location.assign(destination);
      }
    });
  });

  const notificationCount = notificationMenu
    ? notificationMenu.querySelectorAll(':scope > a:not(.av-profile-notification-all)').length
    : 0;

  if (notificationBadge) {
    notificationBadge.textContent = notificationCount ? String(notificationCount) : '';
    notificationBadge.hidden = notificationCount === 0;
    notificationBadge.setAttribute('aria-label', `${notificationCount} notificări necitite`);
  }

  const setPopupState = (button, menu, open) => {
    if (!button || !menu) return;
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('is-open', open);
  };

  const closeProfileMenus = () => {
    setPopupState(statusButton, statusMenu, false);
    setPopupState(notificationButton, notificationMenu, false);
  };

  statusButton?.setAttribute('data-status', 'online');
  statusChoices[0]?.classList.add('is-selected');

  statusButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = statusButton.getAttribute('aria-expanded') !== 'true';
    setPopupState(notificationButton, notificationMenu, false);
    setPopupState(statusButton, statusMenu, willOpen);
  });

  notificationButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = notificationButton.getAttribute('aria-expanded') !== 'true';
    setPopupState(statusButton, statusMenu, false);
    setPopupState(notificationButton, notificationMenu, willOpen);
  });

  statusChoices.forEach((choice) => {
    choice.addEventListener('click', (event) => {
      event.stopPropagation();
      const status = choice.dataset.avStatus;
      const label = choice.textContent.trim().toLowerCase();

      statusChoices.forEach((item) => item.classList.remove('is-selected'));
      choice.classList.add('is-selected');
      statusButton.dataset.status = status;
      statusButton.setAttribute('aria-label', `Stare: ${label}`);
      setPopupState(statusButton, statusMenu, false);
      showProfileToast(`Stare schimbată: ${label}.`);
    });
  });

  statusMenu?.addEventListener('click', (event) => event.stopPropagation());
  notificationMenu?.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', closeProfileMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeProfileMenus();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAniVortexProfileV2, { once: true });
} else {
  initAniVortexProfileV2();
}



