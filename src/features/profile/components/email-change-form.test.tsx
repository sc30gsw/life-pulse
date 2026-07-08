// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { EmailChangeForm } from "~/features/profile/components/email-change-form";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  updateEmail: { mutate: vi.fn() },
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useUpdateEmail: () => state.updateEmail,
}));

test("EmailChangeForm submits email change payload", async () => {
  state.updateEmail.mutate.mockClear();
  state.updateEmail.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<EmailChangeForm />);

  await user.type(getByLabelText("新しいメールアドレス"), "new@example.com");
  await user.type(getByLabelText("現在のパスワード"), "OldPassw0rd1");
  await user.click(getByRole("button", { name: "メールアドレスを変更" }));

  expect(state.updateEmail.mutate).toHaveBeenCalledWith(
    { currentPassword: "OldPassw0rd1", newEmail: "new@example.com" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});
