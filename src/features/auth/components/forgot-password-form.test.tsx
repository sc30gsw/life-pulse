// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { ForgotPasswordForm } from "~/features/auth/components/forgot-password-form";
import { renderWithMantine } from "~/test-utils";

const { notificationsShowMock, requestPasswordResetMock } = vi.hoisted(() => ({
  notificationsShowMock: vi.fn(),
  requestPasswordResetMock: vi.fn().mockResolvedValue(null),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: notificationsShowMock },
}));

vi.mock("convex/react", () => ({
  useAction: () => requestPasswordResetMock,
}));

beforeEach(() => {
  notificationsShowMock.mockClear();
  requestPasswordResetMock.mockClear();
  requestPasswordResetMock.mockResolvedValue(null);
});

test("ForgotPasswordForm requests a password reset email and resets the form", async () => {
  const user = userEvent.setup();
  const { getByPlaceholderText, getByRole } = renderWithMantine(<ForgotPasswordForm />);
  const emailInput = getByPlaceholderText("you@example.com") as HTMLInputElement;

  await user.type(emailInput, "user@example.com");
  await user.click(getByRole("button", { name: "再設定メールを送信" }));

  await vi.waitFor(() => {
    expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: "user@example.com" });
  });
  await vi.waitFor(() => {
    expect(emailInput.value).toBe("");
  });
  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "green",
    message: "登録済みの場合、再設定メールを送信しました",
    title: "送信完了",
  });
});

test("ForgotPasswordForm reports request errors", async () => {
  const user = userEvent.setup();
  requestPasswordResetMock.mockRejectedValueOnce(new ConvexError("EMAIL_SEND_FAILED"));
  const { getByPlaceholderText, getByRole } = renderWithMantine(<ForgotPasswordForm />);

  await user.type(getByPlaceholderText("you@example.com"), "user@example.com");
  await user.click(getByRole("button", { name: "再設定メールを送信" }));

  await vi.waitFor(() => {
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: "red",
      message: "EMAIL_SEND_FAILED",
      title: "送信エラー",
    });
  });
});
