// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { EmailChangeConfirmation } from "~/features/profile/components/email-change-confirmation";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  confirmEmailChange: { isPending: false, mutate: vi.fn() },
  navigate: vi.fn(),
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useConfirmEmailChange: () => state.confirmEmailChange,
}));

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useSearch: () => ({ emailChangeToken: "token-123" }),
  }),
  useNavigate: () => state.navigate,
}));

test("EmailChangeConfirmation confirms the token from profile search params", async () => {
  state.confirmEmailChange.mutate.mockClear();
  state.navigate.mockClear();
  state.confirmEmailChange.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<EmailChangeConfirmation />);

  await user.click(getByRole("button", { name: "メールアドレス変更を確定" }));

  expect(state.confirmEmailChange.mutate).toHaveBeenCalledWith(
    { token: "token-123" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
  expect(state.navigate).toHaveBeenCalledWith({
    search: { emailChangeToken: undefined },
    to: "/profile",
  });
});
