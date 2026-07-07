// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { UserMenu } from "~/features/auth/components/user-menu";
import { renderWithMantine } from "~/test-utils";

const { navigateMock, signOutMock } = vi.hoisted(() => ({
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
    data: { displayName: "テスト太郎", role: "self" },
  }),
}));

test("shows the viewer's display name", () => {
  const { getByText } = renderWithMantine(<UserMenu />);

  expect(getByText("テスト太郎")).toBeDefined();
});

test("offers a /study navigation item in the dropdown", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<UserMenu />);

  await user.click(getByRole("button"));

  const studyItem = getByRole("menuitem", { hidden: true, name: /学習管理/ });
  expect(studyItem.getAttribute("href")).toBe("/study");
});

test("signs out and navigates to /login when the logout item is clicked", async () => {
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
