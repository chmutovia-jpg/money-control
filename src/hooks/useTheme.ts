import { useEffect, useState } from "react";

export type AppTheme = "dark" | "light";

const THEME_KEY = "money-control-theme";

const loadTheme = (): AppTheme => {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(loadTheme);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};
