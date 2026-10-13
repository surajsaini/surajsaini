// This script is deferred, so the page controls are already available.
(() => {
    'use strict';

    const themeToggle = document.getElementById('themeToggle');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let savedTheme;

    try {
        savedTheme = localStorage.getItem('maple-ridge-theme');
    } catch (_) {
        // Theme storage is optional when opening a local file.
    }

    function setTheme(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        if (themeToggle) {
            themeToggle.textContent = dark ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
        }
    }

    setTheme(savedTheme === 'dark' || (savedTheme !== 'light' && systemTheme.matches));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
            savedTheme = dark ? 'dark' : 'light';
            setTheme(dark);
            try {
                localStorage.setItem('maple-ridge-theme', savedTheme);
            } catch (_) {
                // Keep the theme usable for this session if storage is unavailable.
            }
        });
    }

    if (systemTheme.addEventListener) {
        systemTheme.addEventListener('change', (event) => {
            if (savedTheme !== 'dark' && savedTheme !== 'light') setTheme(event.matches);
        });
    }

    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
        function updateScrollToTop() {
            const visible = window.scrollY > 300;
            scrollToTop.classList.toggle('show', visible);
            scrollToTop.tabIndex = visible ? 0 : -1;
        }

        window.addEventListener('scroll', updateScrollToTop, { passive: true });
        updateScrollToTop();

        scrollToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
            });
        });
    }
})();
