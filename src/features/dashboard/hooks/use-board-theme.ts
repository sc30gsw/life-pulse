import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

import type { ThemeMode } from "~/types/dashboard";

const DEFAULT_THEME: ThemeMode = "dark";
const STORAGE_KEY = "board-theme";

export function useBoardTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeMode>({
    defaultValue: DEFAULT_THEME,
    getInitialValueInEffect: true,
    key: STORAGE_KEY,
  });

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { onToggleTheme, theme } as const;
}
