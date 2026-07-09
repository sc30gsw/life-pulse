// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { PasswordChangeForm } from "~/features/profile/components/password-change-form";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  updatePassword: { mutate: vi.fn() },
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useUpdatePassword: () => state.updatePassword,
}));

test("PasswordChangeForm submits current and new password only", async () => {
  state.updatePassword.mutate.mockClear();
  state.updatePassword.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<PasswordChangeForm />);

  await user.type(getByLabelText("現在のパスワード"), "OldPassw0rd1");
  await user.type(getByLabelText("新しいパスワード"), "NewPassw0rd1");
  await user.type(getByLabelText("新しいパスワード(確認)"), "NewPassw0rd1");
  await user.click(getByRole("button", { name: "パスワードを変更" }));

  expect(state.updatePassword.mutate).toHaveBeenCalledWith(
    { currentPassword: "OldPassw0rd1", newPassword: "NewPassw0rd1" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});
