// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { BoardHeader } from "~/features/dashboard/components/board-header";
import { renderWithMantine } from "~/test-utils";

test("renders the clock time and date", () => {
  const { getByText } = renderWithMantine(
    <BoardHeader
      clockDateLabel="7月7日(火)"
      clockTime="12:15"
      onToggleTheme={vi.fn()}
      theme="dark"
      userMenuSlot={<div>user-menu</div>}
    />,
  );

  expect(getByText("12:15")).toBeDefined();
  expect(getByText("7月7日(火) · JST")).toBeDefined();
});

test("renders the userMenuSlot content", () => {
  const { getByText } = renderWithMantine(
    <BoardHeader
      clockDateLabel="7月7日(火)"
      clockTime="12:15"
      onToggleTheme={vi.fn()}
      theme="dark"
      userMenuSlot={<div>user-menu-content</div>}
    />,
  );

  expect(getByText("user-menu-content")).toBeDefined();
});

test("shows the moon icon and light-mode label when theme is dark", () => {
  const { getByRole } = renderWithMantine(
    <BoardHeader
      clockDateLabel="7月7日(火)"
      clockTime="12:15"
      onToggleTheme={vi.fn()}
      theme="dark"
      userMenuSlot={<div />}
    />,
  );

  expect(getByRole("button", { name: "ライトモードに切り替え" })).toBeDefined();
});

test("shows the sun icon and dark-mode label when theme is light", () => {
  const { getByRole } = renderWithMantine(
    <BoardHeader
      clockDateLabel="7月7日(火)"
      clockTime="12:15"
      onToggleTheme={vi.fn()}
      theme="light"
      userMenuSlot={<div />}
    />,
  );

  expect(getByRole("button", { name: "ダークモードに切り替え" })).toBeDefined();
});

test("calls onToggleTheme when the theme button is clicked", async () => {
  const onToggleTheme = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <BoardHeader
      clockDateLabel="7月7日(火)"
      clockTime="12:15"
      onToggleTheme={onToggleTheme}
      theme="dark"
      userMenuSlot={<div />}
    />,
  );

  await user.click(getByRole("button"));

  expect(onToggleTheme).toHaveBeenCalledTimes(1);
});
