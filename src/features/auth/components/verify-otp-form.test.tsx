// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { VerifyOtpForm } from "~/features/auth/components/verify-otp-form";
import { renderWithMantine } from "~/test-utils";

const { navigateMock, notificationsShowMock, sendOtpMock, useActionMock, verifyOtpMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn().mockResolvedValue(undefined),
    notificationsShowMock: vi.fn(),
    sendOtpMock: vi.fn().mockResolvedValue(undefined),
    useActionMock: vi.fn(),
    verifyOtpMock: vi.fn().mockResolvedValue(undefined),
  }));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: notificationsShowMock },
}));

vi.mock("@mantine/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/core")>();

  type PinInputProps = ComponentProps<typeof actual.PinInput>;

  return {
    ...actual,
    PinInput: ({
      "aria-label": ariaLabel,
      disabled,
      onChange,
      onComplete,
      value,
    }: PinInputProps) => (
      <input
        aria-label={ariaLabel}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        onBlur={() => onComplete?.(String(value ?? ""))}
      />
    ),
  };
});

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("convex/react", () => ({
  useAction: useActionMock,
}));

beforeEach(() => {
  let actionIndex = 0;

  navigateMock.mockClear();
  notificationsShowMock.mockClear();
  sendOtpMock.mockClear();
  verifyOtpMock.mockClear();
  useActionMock.mockImplementation(() => {
    const action = actionIndex % 2 === 0 ? verifyOtpMock : sendOtpMock;
    actionIndex += 1;

    return action;
  });
});

test("submits a complete OTP code and navigates home", async () => {
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<VerifyOtpForm />);

  await user.type(getByLabelText("One time code"), "123456");
  await user.click(getByRole("button", { name: "確認" }));

  await vi.waitFor(() => {
    expect(verifyOtpMock).toHaveBeenCalledWith({ code: "123456" });
  });
  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "green",
    message: "確認が完了しました",
    title: "OTP確認",
  });
  expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
});

test("does not submit an incomplete OTP code", async () => {
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<VerifyOtpForm />);

  await user.type(getByLabelText("One time code"), "1");
  await user.click(getByRole("button", { name: "確認" }));

  expect(verifyOtpMock).not.toHaveBeenCalled();
});

test("resends the OTP code", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<VerifyOtpForm />);

  await user.click(getByRole("button", { name: "再送" }));

  await vi.waitFor(() => {
    expect(sendOtpMock).toHaveBeenCalledWith({});
  });
  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "green",
    message: "確認コードを送信しました",
    title: "OTP送信",
  });
});
