(() => {
  'use strict';
  const home = document.getElementById('homePage');
  const reader = document.getElementById('readerLayout');
  const chapters = [...document.querySelectorAll('.content-section')];
  const menuButton = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const baseTitle = document.title;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    document.getElementById('menuLabel').textContent = 'Menu';
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    document.getElementById('menuLabel').textContent = open ? 'Close' : 'Menu';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && (!event.target.closest('.site-header') || event.target.closest('a'))) closeMenu();
  });
  window.matchMedia('(min-width: 561px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  chapters.forEach(chapter => {
    const body = chapter.querySelector('.article-body');
    if (!body) return;
    const minutes = Math.max(1, Math.ceil(body.textContent.trim().split(/\s+/).length / 220));
    document.querySelectorAll(`[data-read-time="${chapter.id}"]`).forEach(label => {
      label.textContent = `${minutes} min read`;
    });
  });

  // Keep the original chapter URLs and native browser history.
  // Without JavaScript, the complete research remains readable in document order.
  function navigate(initial = false) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const article = chapters.find(chapter => chapter.id === id);
    home.hidden = Boolean(article);
    reader.hidden = !article;
    chapters.forEach(chapter => { chapter.hidden = chapter !== article; });
    document.title = article ? `${article.querySelector('h1').textContent} — Real Finance Decoded` : baseTitle;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const active = (link.dataset.nav === 'research' && (id === 'explore' || (article && id !== 'resources')))
        || (link.dataset.nav === 'resources' && id === 'resources')
        || (link.dataset.nav === 'about' && ['about', 'contact'].includes(id));
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    closeMenu();
    requestAnimationFrame(() => {
      if (article) {
        window.scrollTo({top:0, behavior:'instant'});
        if (!initial) article.querySelector('h1').focus({preventScroll:true});
      } else {
        const target = document.getElementById(id) || home;
        target.scrollIntoView({behavior:initial || reducedMotion.matches ? 'instant' : 'smooth'});
        const heading = target.querySelector('h1, h2');
        if (!initial && heading) {
          heading.tabIndex = -1;
          heading.focus({preventScroll:true});
        }
      }
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hash === '#main') {
      event.preventDefault();
      document.getElementById('main').focus();
    } else if (link.hash === location.hash) {
      event.preventDefault();
      navigate();
    }
  });
  window.addEventListener('hashchange', () => navigate());
  navigate(true);
})();
