import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  mode: "light",
  bg: {
    primary: "#f8f9fa",
    secondary: "#ffffff",
    tertiary: "#f0f1f3",
  },
  text: {
    primary: "#0a0e27",
    secondary: "#64748b",
    tertiary: "#94a3b8",
  },
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
  },
  accent: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
  },
};

const darkTheme = {
  mode: "dark",
  bg: {
    primary: "#0f1419",
    secondary: "#1a1e2e",
    tertiary: "#242b3d",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#cbd5e1",
    tertiary: "#94a3b8",
  },
  border: {
    light: "#334155",
    medium: "#475569",
  },
  accent: {
    primary: "#a78bfa",
    secondary: "#c4b5fd",
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
