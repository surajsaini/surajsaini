(() => {
  'use strict';
  const toggle = document.getElementById('themeToggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme;
  try { savedTheme = localStorage.getItem('maple-ridge-theme'); } catch (_) { /* Storage is optional. */ }
  const applyTheme = (dark) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    toggle.textContent = dark ? 'Light theme' : 'Dark theme';
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  };
  applyTheme(savedTheme === 'dark' || (savedTheme !== 'light' && systemTheme.matches));
  toggle.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    savedTheme = dark ? 'dark' : 'light';
    applyTheme(dark);
    try { localStorage.setItem('maple-ridge-theme', savedTheme); } catch (_) { /* Keep the current session usable. */ }
  });
  systemTheme.addEventListener('change', (event) => {
    if (savedTheme !== 'dark' && savedTheme !== 'light') applyTheme(event.matches);
  });
  const topButton = document.getElementById('scrollToTop');
  const updateTopButton = () => { topButton.hidden = window.scrollY < 500; };
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();
