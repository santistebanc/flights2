// Theme utility functions
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  if (stored && (stored === "light" || stored === "dark")) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  // Default to dark theme
  return "dark";
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function initializeTheme() {
  const theme = getTheme();
  setTheme(theme);
}

// Initialize theme on import
if (typeof window !== "undefined") {
  initializeTheme();
}
