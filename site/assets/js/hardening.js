(() => {
  'use strict';

  function toggleStaticReaction(button) {
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
    button.classList.toggle('is-active', !pressed);

    const count = button.querySelector('.react-count');
    if (!count) return;
    const current = Number.parseInt(count.textContent || '0', 10) || 0;
    count.textContent = String(Math.max(0, current + (pressed ? -1 : 1)));
  }


  // Bridge the former inline handlers to delegated events so script-src can stay 'self'.
  document.addEventListener('click', (event) => {
    const disabledLink = event.target.closest('a[aria-disabled="true"]');
    if (disabledLink) {
      event.preventDefault();
      return;
    }

    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    const call = (name, ...args) => {
      const fn = globalThis[name];
      if (typeof fn === 'function') fn(...args);
    };

    switch (action) {
      case 'toggle-react':
        toggleStaticReaction(trigger);
        break;
      case 'open-chest-reward':
        call('openChestReward');
        break;
      case 'open-donate-modal':
        call('openDonateModal');
        break;
      case 'close-modal': {
        const modal = trigger.closest('.modal-overlay');
        if (modal) modal.classList.remove('show');
        break;
      }
      default:
        break;
    }
  });


  // Harden links created later by scripts as well.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', [...rel].join(' '));
    });
  }, { once: true });
})();
