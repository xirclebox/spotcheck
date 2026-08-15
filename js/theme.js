/**
 * SpotCheck Theme Manager
 * Handles light/dark theme switching with localStorage persistence
 */

const ThemeManager = (() => {
  const STATE_KEY = "__spotcheck_theme";
  const THEME_ATTRIBUTE = "data-theme";
  const LIGHT_THEME = "light";
  const DARK_THEME = "dark";
  const AUTO_THEME = "system";

  /**
   * Get the system's preferred color scheme
   * @returns {string} 'light' or 'dark'
   */
  const getSystemPreference = () => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return DARK_THEME;
    }
    return LIGHT_THEME;
  };

  /**
   * Get the current theme setting from localStorage
   * @returns {string} 'light', 'dark', or 'system'
   */
  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      return saved && [LIGHT_THEME, DARK_THEME, AUTO_THEME].includes(saved)
        ? saved
        : AUTO_THEME;
    } catch (e) {
      return AUTO_THEME;
    }
  };

  /**
   * Save theme preference to localStorage
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  const saveTheme = (theme) => {
    try {
      localStorage.setItem(STATE_KEY, theme);
    } catch (e) {
      console.warn("Could not save theme preference to localStorage:", e);
    }
  };

  /**
   * Apply the theme to the document
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  const applyTheme = (theme) => {
    const html = document.documentElement;

    if (theme === AUTO_THEME) {
      // Auto mode: respect system preference
      html.removeAttribute(THEME_ATTRIBUTE);
    } else {
      // Explicit light or dark mode
      html.setAttribute(THEME_ATTRIBUTE, theme);
    }

    // Dispatch event for other components to react to theme change
    window.dispatchEvent(
      new CustomEvent("spotcheck-theme-change", {
        detail: {
          theme,
          effectiveTheme: theme === AUTO_THEME ? getSystemPreference() : theme,
        },
      }),
    );
  };

  /**
   * Initialize theme on page load
   */
  const init = () => {
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("theme-toggle-container");
      if (container && ThemeManager) {
        ThemeManager.createToggle(container);
      }
    });

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        const currentTheme = getSavedTheme();
        if (currentTheme === AUTO_THEME) {
          applyTheme(AUTO_THEME);
        }
      });
    }
  };

  /**
   * Set the theme
   * @param {string} theme - 'light', 'dark', or 'sys'
   */
  const setTheme = (theme) => {
    if (![LIGHT_THEME, DARK_THEME, AUTO_THEME].includes(theme)) {
      console.warn(
        `Invalid theme: ${theme}. Must be 'light', 'dark', or 'system'.`,
      );
      return;
    }
    saveTheme(theme);
    applyTheme(theme);
  };

  /**
   * Get the current theme setting
   * @returns {string} 'light', 'dark', or 'system'
   */
  const getTheme = () => {
    return getSavedTheme();
  };

  /**
   * Get the effective theme being applied
   * Takes into account 'system' mode
   * @returns {string} 'light' or 'dark'
   */
  const getEffectiveTheme = () => {
    const theme = getSavedTheme();
    return theme === AUTO_THEME ? getSystemPreference() : theme;
  };

  /**
   * Toggle between light and dark themes
   * If currently in auto mode, switches to dark, then light, then auto
   */
  const toggleTheme = () => {
    const current = getSavedTheme();
    const next =
      current === LIGHT_THEME
        ? DARK_THEME
        : current === DARK_THEME
          ? AUTO_THEME
          : LIGHT_THEME;
    setTheme(next);
  };

  /**
   * Create and inject theme toggle component
   * @param {HTMLElement} container - Element to inject toggle into
   * @returns {HTMLElement} The toggle element
   */
  const createToggle = (container = null) => {
    const toggle = document.createElement("div");
    toggle.className = "theme-toggle";
    toggle.setAttribute("aria-label", "Theme selector");

    const button = document.createElement("button");
    button.className = "theme-toggle__button";
    button.type = "button";
    button.setAttribute("aria-label", "Toggle theme");
    button.setAttribute("aria-pressed", "false");

    const updateToggle = () => {
      const theme = getTheme();
      const effectiveTheme = getEffectiveTheme();

      // Update button icon
      switch (theme) {
        case LIGHT_THEME:
          button.textContent = "Light";
         
          break;
        case DARK_THEME:
          button.textContent = "Dark";
          
          break;
        case AUTO_THEME:
          button.textContent = effectiveTheme === DARK_THEME ? "System" : "Light";
          break;
      }
    };

    button.addEventListener("click", () => {
      toggleTheme();
      updateToggle();
    });

    toggle.appendChild(button);

    if (container) {
      container.appendChild(toggle);
    }

    // Initial update
    updateToggle();

    // Listen for theme changes from other sources
    window.addEventListener("spotcheck-theme-change", updateToggle);

    return toggle;
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    init,
    setTheme,
    getTheme,
    getEffectiveTheme,
    getSystemPreference,
    toggleTheme,
    createToggle,
  };
})();
