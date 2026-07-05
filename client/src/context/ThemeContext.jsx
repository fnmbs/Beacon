import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  mode: "light",
  bg: {
    primary: "#ffffff",
    secondary: "#f5f5f5",
    tertiary: "#f0f0f0",
    sidebar: "#1a1a1a",
  },
  text: {
    primary: "#111111",
    secondary: "#666666",
    tertiary: "#999999",
    sidebar: "#e5e5e5",
  },
  border: {
    light: "#e5e5e5",
    medium: "#d0d0d0",
  },
  accent: {
    primary: "#111111",
    secondary: "#444444",
  },
};

const darkTheme = {
  mode: "dark",
  bg: {
    primary: "#1a1a1a",
    secondary: "#242424",
    tertiary: "#2a2a2a",
    sidebar: "#141414",
  },
  text: {
    primary: "#f5f5f5",
    secondary: "#aaaaaa",
    tertiary: "#777777",
    sidebar: "#cccccc",
  },
  border: {
    light: "#333333",
    medium: "#444444",
  },
  accent: {
    primary: "#ffffff",
    secondary: "#cccccc",
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", isDark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ ...theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
