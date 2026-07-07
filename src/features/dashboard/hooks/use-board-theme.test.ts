// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { useBoardTheme } from "~/features/dashboard/hooks/use-board-theme";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

test("starts in dark mode and writes it to the document dataset", () => {
  const { result } = renderHook(() => useBoardTheme());

  expect(result.current.theme).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

test("onToggleTheme flips the theme and updates the document dataset", () => {
  const { result } = renderHook(() => useBoardTheme());

  act(() => {
    result.current.onToggleTheme();
  });

  expect(result.current.theme).toBe("light");
  expect(document.documentElement.dataset.theme).toBe("light");
});

test("onToggleTheme flips light mode back to dark mode", () => {
  const { result } = renderHook(() => useBoardTheme());

  act(() => {
    result.current.onToggleTheme();
    result.current.onToggleTheme();
  });

  expect(result.current.theme).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});
