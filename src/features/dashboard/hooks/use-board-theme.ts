import { useEffect, useState } from "react";

import type { ThemeMode } from "~/features/dashboard/types/dashboard";

export function useBoardTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { onToggleTheme, theme } as const;
}
