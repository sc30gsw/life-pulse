// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { UserMenu } from "~/features/auth/components/user-menu";
import { renderWithMantine } from "~/test-utils";

const { hookState, navigateMock, signOutMock } = vi.hoisted(() => ({
  hookState: { viewerRole: "self" as "partner" | "self" },
  navigateMock: vi.fn(),
  signOutMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: vi.fn(), signOut: signOutMock }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  // The /study Menu.Item renders a router Link, which needs a RouterProvider
  // in the real app — stub it with a plain anchor for standalone rendering.
  Link: ({ children, to, ...rest }: Record<string, unknown> & Record<"to", string>) => (
    <a href={to} {...rest}>
      {children as never}
    </a>
  ),
  useNavigate: () => navigateMock,
}));

vi.mock("~/features/auth/hooks/use-viewer", () => ({
  useViewer: () => ({
    data: { displayName: "テスト太郎", role: hookState.viewerRole },
  }),
}));

test("shows the viewer's display name", () => {
  hookState.viewerRole = "self";

  const { getByText } = renderWithMantine(<UserMenu />);

  expect(getByText("テスト太郎")).toBeDefined();
});

test("offers a /study navigation item in the dropdown", async () => {
  hookState.viewerRole = "self";

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));

  const studyItem = getByRole("menuitem", { hidden: true, name: /学習管理/ });
  expect(studyItem.getAttribute("href")).toBe("/study");
});

test("offers a /fasting navigation item in the dropdown", async () => {
  hookState.viewerRole = "self";

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));

  const fastingItem = getByRole("menuitem", { hidden: true, name: /断食/ });
  expect(fastingItem.getAttribute("href")).toBe("/fasting");
});

test("offers /health and /settings navigation items for the self viewer", async () => {
  hookState.viewerRole = "self";

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));

  const healthItem = getByRole("menuitem", { hidden: true, name: /健康/ });
  expect(healthItem.getAttribute("href")).toBe("/health");

  const settingsItem = getByRole("menuitem", { hidden: true, name: /設定/ });
  expect(settingsItem.getAttribute("href")).toBe("/settings");
});

test("hides /health and /settings navigation items for the partner viewer", async () => {
  hookState.viewerRole = "partner";

  const user = userEvent.setup();
  const { getByRole, queryByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));

  expect(queryByRole("menuitem", { hidden: true, name: /健康/ })).toBeNull();
  expect(queryByRole("menuitem", { hidden: true, name: /設定/ })).toBeNull();
});

test("signs out and navigates to /login when the logout item is clicked", async () => {
  hookState.viewerRole = "self";

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));
  //* Mantine's Menu.Dropdown is positioned by Floating UI, which cannot
  //* measure layout in happy-dom and leaves it at `display: none`; query
  //* with `hidden: true` to reach the item anyway.
  await user.click(getByRole("menuitem", { hidden: true, name: /ログアウト/ }));

  await vi.waitFor(() => {
    expect(signOutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
  });
});
