(function () {
  const THEME_KEY = "vehicleDetailTheme";

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const isDark = theme === "dark";
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.setAttribute("aria-label", isDark ? "Switch to day mode" : "Switch to night mode");
      const icon = button.querySelector(".theme-toggle-icon");
      const label = button.querySelector(".theme-toggle-label");
      if (icon) icon.textContent = isDark ? "\u2600" : "\u263E";
      if (label) label.textContent = isDark ? "Day" : "Night";
    });
  }

  function readStoredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch (error) {
      // ignore storage errors
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function initTheme() {
    applyTheme(readStoredTheme());
  }

  function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // ignore storage errors
    }
    applyTheme(next);
  }

  function bindThemeToggles() {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", toggleTheme);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTheme();
      bindThemeToggles();
    });
  } else {
    initTheme();
    bindThemeToggles();
  }

  window.initTheme = initTheme;
  window.toggleTheme = toggleTheme;
})();
