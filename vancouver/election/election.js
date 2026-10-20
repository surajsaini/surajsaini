// Shared controls are optional so every election page can use this file.
(() => {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let savedTheme;
    try {
        savedTheme = window.localStorage.getItem('theme');
    } catch {
        // Use the system preference when browser storage is unavailable.
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }

    setTheme(savedTheme === 'dark' || (!savedTheme && prefersDarkScheme) ? 'dark' : 'light');
    themeToggle?.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(theme);
        try {
            window.localStorage.setItem('theme', theme);
        } catch {
            // Theme selection still works for the current page.
        }
    });

    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        const updateScrollToTop = () => {
            const visible = window.scrollY > 300;
            scrollToTopBtn.classList.toggle('show', visible);
            scrollToTopBtn.tabIndex = visible ? 0 : -1;
        };
        window.addEventListener('scroll', updateScrollToTop, { passive: true });
        updateScrollToTop();
        scrollToTopBtn.addEventListener('click', () => {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
        });
    }

    // All panels remain readable in the HTML when JavaScript is unavailable.
    document.querySelectorAll('[data-panel-picker]').forEach(picker => {
        const select = picker.querySelector('[data-panel-select]');
        const results = select && document.getElementById(select.getAttribute('aria-controls'));
        if (!select || !results?.hasAttribute('data-panel-results')) return;
        const panels = Array.from(results.querySelectorAll('[data-panel]'));
        if (!panels.length) return;

        function hashId() {
            try {
                return decodeURIComponent(window.location.hash.slice(1));
            } catch {
                return '';
            }
        }

        function showPanel(id) {
            const selected = panels.find(panel => panel.id === id);
            if (!selected) return;
            select.value = selected.id;
            panels.forEach(panel => { panel.hidden = panel !== selected; });
        }

        const initial = panels.find(panel => panel.id === hashId())
            || panels.find(panel => panel.id === select.value)
            || panels[0];
        showPanel(initial.id);
        picker.hidden = false;

        select.addEventListener('change', () => {
            if (!panels.some(panel => panel.id === select.value)) return;
            showPanel(select.value);
            window.history.replaceState(null, '', '#' + encodeURIComponent(select.value));
        });

        window.addEventListener('hashchange', () => {
            // Skip links and other in-page anchors must not reset the selection.
            showPanel(hashId());
        });
    });
})();
