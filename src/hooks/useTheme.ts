import { useEffect, useState } from "react";
import { safeGetItem, safeSetItem } from "../utils/storage";

export type AppTheme = "dark" | "light";

const THEME_KEY = "money-control-theme";

const loadTheme = (): AppTheme => {
  const stored = safeGetItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(loadTheme);

  useEffect(() => {
    safeSetItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};
