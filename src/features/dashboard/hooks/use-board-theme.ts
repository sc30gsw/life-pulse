import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

import type { ThemeMode } from "~/features/dashboard/types/dashboard";

export function useBoardTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeMode>({
    defaultValue: "dark",
    key: "board-theme",
  });

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { onToggleTheme, theme } as const;
}
