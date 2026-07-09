// @vitest-environment happy-dom
import { Menu } from "@mantine/core";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { LogoutButton } from "~/features/auth/components/logout-button";
import { renderWithMantine } from "~/test-utils";

const { navigateMock, signOutMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  signOutMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: signOutMock }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

test("signs out and navigates to login when clicked", async () => {
  signOutMock.mockClear();
  navigateMock.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(
    <Menu opened>
      <Menu.Dropdown>
        <LogoutButton />
      </Menu.Dropdown>
    </Menu>,
  );

  await user.click(getByRole("menuitem", { hidden: true, name: /ログアウト/ }));

  await vi.waitFor(() => {
    expect(signOutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
  });
});
