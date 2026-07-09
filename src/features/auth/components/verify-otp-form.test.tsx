// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { VerifyOtpForm } from "~/features/auth/components/verify-otp-form";
import { renderWithMantine } from "~/test-utils";

const {
  navigateMock,
  notificationsShowMock,
  secondFactorStatusState,
  sendOtpMock,
  useActionMock,
  verifyOtpMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn().mockResolvedValue(undefined),
  notificationsShowMock: vi.fn(),
  secondFactorStatusState: {
    value: {
      required: true,
      resendAvailableAt: Date.now() + 60_000,
      verified: false,
    } as
      | {
          required: boolean;
          resendAvailableAt: number | null;
          verified: boolean;
        }
      | undefined,
  },
  sendOtpMock: vi.fn().mockResolvedValue(undefined),
  useActionMock: vi.fn(),
  verifyOtpMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: notificationsShowMock },
}));

vi.mock("@mantine/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/core")>();

  type ButtonProps = {
    children?: ReactNode;
    disabled?: boolean;
    leftSection?: ReactNode;
    loading?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "reset" | "submit";
  };
  type GroupProps = { children?: ReactNode };
  type MantineProviderProps = ComponentProps<typeof actual.MantineProvider> & {
    children?: ReactNode;
  };
  type PinInputProps = ComponentProps<typeof actual.PinInput>;

  return {
    ...actual,
    Button: ({ children, disabled, leftSection, loading, onClick, type }: ButtonProps) => (
      <button
        aria-busy={loading ? "true" : undefined}
        disabled={disabled || loading}
        type={type}
        onClick={onClick}
      >
        {leftSection}
        {children}
      </button>
    ),
    Group: ({ children }: GroupProps) => <div>{children}</div>,
    MantineProvider: ({ children }: MantineProviderProps) => <>{children}</>,
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
  useQuery: () => secondFactorStatusState.value,
}));

beforeEach(() => {
  let actionIndex = 0;

  navigateMock.mockClear();
  notificationsShowMock.mockClear();
  secondFactorStatusState.value = {
    required: true,
    resendAvailableAt: Date.now() + 60_000,
    verified: false,
  };
  sendOtpMock.mockClear();
  sendOtpMock.mockResolvedValue(undefined);
  verifyOtpMock.mockClear();
  verifyOtpMock.mockResolvedValue(undefined);
  useActionMock.mockImplementation(() => {
    const action = actionIndex % 2 === 0 ? verifyOtpMock : sendOtpMock;
    actionIndex += 1;

    return action;
  });
});

afterEach(() => {
  vi.useRealTimers();
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
  secondFactorStatusState.value = undefined;
  const { getByRole } = renderWithMantine(<VerifyOtpForm />);

  await user.click(getByRole("button", { name: "再送" }));

  await vi.waitFor(() => {
    expect(sendOtpMock).toHaveBeenCalledWith({});
  });
  await vi.waitFor(() => {
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: "green",
      message: "確認コードを送信しました",
      title: "OTP送信",
    });
  });
});

test("disables resend while the active challenge is cooling down", () => {
  const { getByRole } = renderWithMantine(<VerifyOtpForm />);
  const resendButton = getByRole("button", { name: "再送 (60s)" }) as HTMLButtonElement;

  expect(resendButton.disabled).toBe(true);
});

test("shows resend wait errors as cooldown feedback", async () => {
  const user = userEvent.setup();
  secondFactorStatusState.value = undefined;
  sendOtpMock.mockRejectedValueOnce(new ConvexError("OTP_RESEND_WAIT"));
  const { getByRole } = renderWithMantine(<VerifyOtpForm />);

  await user.click(getByRole("button", { name: "再送" }));

  await vi.waitFor(() => {
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: "yellow",
      message: "確認コードはまだ再送できません。少し待ってから再送してください",
      title: "再送待機中",
    });
  });
});

test("sends an OTP when the form opens without an active challenge", async () => {
  secondFactorStatusState.value = { required: true, resendAvailableAt: null, verified: false };

  renderWithMantine(<VerifyOtpForm />);

  await vi.waitFor(() => {
    expect(sendOtpMock).toHaveBeenCalledWith({});
  });
  await vi.waitFor(() => {
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: "green",
      message: "確認コードを送信しました",
      title: "OTP送信",
    });
  });
});

test("shows a structural shimmer while the initial OTP send is pending", async () => {
  secondFactorStatusState.value = { required: true, resendAvailableAt: null, verified: false };
  sendOtpMock.mockReturnValueOnce(new Promise(() => {}));

  const { queryByRole } = renderWithMantine(<VerifyOtpForm />);

  await vi.waitFor(() => {
    expect(sendOtpMock).toHaveBeenCalledWith({});
  });

  expect(queryByRole("button", { name: "再送" })).toBeNull();
  expect(notificationsShowMock).not.toHaveBeenCalled();
});
