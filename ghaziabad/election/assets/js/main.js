/**
 * Ghaziabad Election Website - Main JavaScript
 * Dark mode toggle with localStorage persistence
 * Accordion card functionality
 */

// Set dark mode immediately before page renders (prevents flash)
(function () {
  const savedTheme = localStorage.getItem('ghaziabad-election-theme');
  if (!savedTheme) {
    // No saved theme, set dark as default
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('ghaziabad-election-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
})();

(function () {
  'use strict';

  // Theme Management
  const ThemeManager = {
    STORAGE_KEY: 'ghaziabad-election-theme',
    DARK: 'dark',
    LIGHT: 'light',

    init() {
      // Theme is already set by the immediate script above
      // Just bind the toggle and update button
      const currentTheme = document.documentElement.getAttribute('data-theme') || this.DARK;
      this.updateToggleButton(currentTheme);
      this.bindToggle();
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.updateToggleButton(theme);
    },

    toggle() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === this.DARK ? this.LIGHT : this.DARK;
      this.setTheme(newTheme);
    },

    updateToggleButton(theme) {
      const toggleBtn = document.querySelector('.theme-toggle');
      if (toggleBtn) {
        const icon = toggleBtn.querySelector('.theme-toggle-icon');
        const text = toggleBtn.querySelector('.theme-toggle-text');

        if (icon) {
          icon.textContent = theme === this.DARK ? '☀️' : '🌙';
        }
        if (text) {
          text.textContent = theme === this.DARK ? 'Light' : 'Dark';
        }
      }
    },

    bindToggle() {
      const toggleBtn = document.querySelector('.theme-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggle());
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }
})();

/**
 * Toggle accordion card open/close
 * @param {HTMLElement} header - The card header element that was clicked
 */
function toggleCard(header) {
  const card = header.closest('.constituency-card');
  if (card) {
    card.classList.toggle('active');
  }
}
