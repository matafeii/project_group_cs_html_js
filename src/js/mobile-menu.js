const openBtn = document.querySelector('[data-menu-open]');
const closeBtn = document.querySelector('[data-menu-close]');
const menu = document.querySelector('[data-menu]');

if (!openBtn || !closeBtn || !menu) {
  // Header is not present on this page.
} else {
  function syncAria(isOpen) {
    openBtn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
  }

  function openMenu() {
    menu.classList.add('is-open');
    document.body.classList.add('no-scroll');
    syncAria(true);
    closeBtn.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    syncAria(false);
    openBtn.focus();
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  menu.addEventListener('click', e => {
    if (e.target === menu) {
      closeMenu();
      return;
    }

    if (e.target.closest('.mobile-nav-link')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  syncAria(false);
}
