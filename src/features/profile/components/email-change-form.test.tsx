// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { EmailChangeForm } from "~/features/profile/components/email-change-form";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  requestEmailChange: { mutate: vi.fn() },
}));

vi.mock("~/features/profile/hooks/use-profile-actions", () => ({
  useRequestEmailChange: () => state.requestEmailChange,
}));

test("EmailChangeForm requests a confirmation email without asking for the current password", async () => {
  state.requestEmailChange.mutate.mockClear();
  state.requestEmailChange.mutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole, queryByLabelText } = renderWithMantine(<EmailChangeForm />);

  await user.type(getByLabelText("新しいメールアドレス"), "new@example.com");
  expect(queryByLabelText("現在のパスワード")).toBeNull();
  await user.click(getByRole("button", { name: "確認メールを送信" }));

  expect(state.requestEmailChange.mutate).toHaveBeenCalledWith(
    { newEmail: "new@example.com" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});
