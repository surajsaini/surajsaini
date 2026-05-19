(function () {
  "use strict";

  const storageKey = "gautam-buddha-nagar-election-theme";
  const root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.textContent = theme === "dark" ? "Light" : "Dark";
      button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    });
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(storageKey);
    const initialTheme = savedTheme || root.getAttribute("data-theme") || "light";
    setTheme(initialTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    });
  }

  function initMenu() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (!menuButton || !nav) {
      return;
    }

    menuButton.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initFilters() {
    const search = document.querySelector("[data-result-search]");
    const buttons = Array.from(document.querySelectorAll("[data-year-filter]"));
    const rows = Array.from(document.querySelectorAll("[data-result-row]"));
    const count = document.querySelector("[data-result-count]");

    if (!rows.length) {
      return;
    }

    let activeYear = "all";

    function applyFilters() {
      const query = search ? search.value.trim().toLowerCase() : "";
      let visibleRows = 0;

      rows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        const rowYear = row.getAttribute("data-year");
        const matchesYear = activeYear === "all" || rowYear === activeYear;
        const matchesQuery = !query || rowText.includes(query);
        const showRow = matchesYear && matchesQuery;

        row.hidden = !showRow;
        if (showRow) {
          visibleRows += 1;
        }
      });

      if (count) {
        count.textContent = `${visibleRows} result${visibleRows === 1 ? "" : "s"} shown`;
      }
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeYear = button.getAttribute("data-year-filter") || "all";
        buttons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  function initAccordions() {
    document.querySelectorAll("[data-expand-all]").forEach((button) => {
      button.addEventListener("click", () => {
        const details = Array.from(document.querySelectorAll("details[data-election-details]"));
        const shouldOpen = details.some((item) => !item.open);
        details.forEach((item) => {
          item.open = shouldOpen;
        });
        button.textContent = shouldOpen ? "Collapse all" : "Expand all";
      });
    });
  }

  function init() {
    initTheme();
    initMenu();
    initFilters();
    initAccordions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
