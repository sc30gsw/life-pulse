// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { BoardHeader } from "~/features/dashboard/components/board-header";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  onToggleTheme: vi.fn(),
  suspendUserMenu: false,
  theme: "dark" as "dark" | "light",
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  // The brand Stack renders a router Link, which needs a RouterProvider in the
  // real app — stub it with a plain anchor for standalone rendering.
  Link: ({ children, to, ...rest }: Record<string, unknown> & Record<"to", string>) => (
    <a href={to} {...rest}>
      {children as never}
    </a>
  ),
}));

vi.mock("~/features/auth/components/user-menu", () => ({
  UserMenu: () => {
    if (hookState.suspendUserMenu) {
      throw new Promise(() => {});
    }

    return <div>user-menu-content</div>;
  },
  UserMenuFallback: () => <div>user-menu-fallback</div>,
}));

vi.mock("~/features/dashboard/hooks/use-board-clock", () => ({
  useBoardClock: () => ({
    clockDateLabel: "7月7日(火)",
    clockDateLabelCompact: "7/7(火)",
    clockTime: "12:15",
    dateJst: "2026-07-07",
    nowMs: 0,
  }),
}));

vi.mock("~/features/dashboard/hooks/use-board-theme", () => ({
  useBoardTheme: () => ({
    onToggleTheme: hookState.onToggleTheme,
    theme: hookState.theme,
  }),
}));

beforeEach(() => {
  hookState.suspendUserMenu = false;
  hookState.theme = "dark";
  hookState.onToggleTheme.mockClear();
});

test("renders the clock time and date", () => {
  const { getByText } = renderWithMantine(<BoardHeader />);

  expect(getByText("12:15")).toBeDefined();
  expect(getByText("7月7日(火) · JST")).toBeDefined();
  expect(getByText("7/7(火) · JST")).toBeDefined();
});

test("wraps the brand in a link back to the live board", () => {
  const { getByRole } = renderWithMantine(<BoardHeader />);

  const brandLink = getByRole("link", { name: /Life Pulse/ });
  expect(brandLink.getAttribute("href")).toBe("/");
});

test("renders the user menu", () => {
  const { getByText } = renderWithMantine(<BoardHeader />);

  expect(getByText("user-menu-content")).toBeDefined();
});

test("renders the user menu fallback while the menu suspends", () => {
  hookState.suspendUserMenu = true;

  const { getByText } = renderWithMantine(<BoardHeader />);

  expect(getByText("user-menu-fallback")).toBeDefined();
});

test("shows the light-mode label when theme is dark", () => {
  const { getByRole } = renderWithMantine(<BoardHeader />);

  expect(getByRole("button", { name: "ライトモードに切り替え" })).toBeDefined();
});

test("shows the dark-mode label when theme is light", () => {
  hookState.theme = "light";

  const { getByRole } = renderWithMantine(<BoardHeader />);

  expect(getByRole("button", { name: "ダークモードに切り替え" })).toBeDefined();
});

test("calls onToggleTheme when the theme button is clicked", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<BoardHeader />);

  await user.click(getByRole("button"));

  expect(hookState.onToggleTheme).toHaveBeenCalledTimes(1);
});
