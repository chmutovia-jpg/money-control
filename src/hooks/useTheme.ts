import { useEffect, useState } from "react";
import { safeGetItem, safeSetItem } from "../utils/storage";

export type AppTheme = "glass-light" | "midnight-finance" | "graphite-pro" | "aurora" | "minimal-paper";

const THEME_KEY = "money-control-theme";

const loadTheme = (): AppTheme => {
  const stored = safeGetItem(THEME_KEY);
  if (stored === "light") return "glass-light";
  if (stored === "dark") return "midnight-finance";
  if (stored === "glass-light" || stored === "midnight-finance" || stored === "graphite-pro" || stored === "aurora" || stored === "minimal-paper") return stored;
  return "midnight-finance";
};

export const themeOptions: Array<{ id: AppTheme; name: string; description: string; swatches: string[] }> = [
  { id: "glass-light", name: "Glass Light", description: "Светлый финтех-glass", swatches: ["#f7fbff", "#ffffff", "#2563eb"] },
  { id: "midnight-finance", name: "Midnight Finance", description: "Глубокий тёмный режим", swatches: ["#010308", "#111827", "#60a5fa"] },
  { id: "graphite-pro", name: "Graphite Pro", description: "Строгий графитовый стиль", swatches: ["#0b0d10", "#1d2128", "#a3a3a3"] },
  { id: "aurora", name: "Aurora", description: "Мягкое северное сияние", swatches: ["#050816", "#13243a", "#2dd4bf"] },
  { id: "minimal-paper", name: "Minimal Paper", description: "Тёплая бумажная светлая тема", swatches: ["#faf7f0", "#ffffff", "#0f766e"] },
];

export const useTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(loadTheme);

  useEffect(() => {
    safeSetItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};
