// This script is deferred, so the page controls are already available.
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

const currentTheme = localStorage.getItem('theme');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(currentTheme === 'dark' || (!currentTheme && prefersDarkScheme) ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(theme);
    localStorage.setItem('theme', theme);
});

const scrollToTopBtn = document.getElementById('scrollToTop');

function updateScrollToTop() {
    scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
}

window.addEventListener('scroll', updateScrollToTop);
updateScrollToTop();

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
