// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { ResetPasswordForm } from "~/features/auth/components/reset-password-form";
import { renderWithMantine } from "~/test-utils";

const { navigateMock, notificationsShowMock, resetPasswordMock, routeSearchState } = vi.hoisted(
  () => ({
    navigateMock: vi.fn(),
    notificationsShowMock: vi.fn(),
    resetPasswordMock: vi.fn().mockResolvedValue(null),
    routeSearchState: { value: { token: "reset-token" } },
  }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: notificationsShowMock },
}));

vi.mock("convex/react", () => ({
  useAction: () => resetPasswordMock,
}));

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useSearch: () => routeSearchState.value,
  }),
  useNavigate: () => navigateMock,
}));

beforeEach(() => {
  navigateMock.mockClear();
  notificationsShowMock.mockClear();
  resetPasswordMock.mockClear();
  resetPasswordMock.mockResolvedValue(null);
  routeSearchState.value = { token: "reset-token" };
});

function inputByName(container: HTMLElement, name: string) {
  const input = container.querySelector<HTMLInputElement>(`input[name='["${name}"]']`);

  if (input === null) {
    throw new Error(`Missing input ${name}`);
  }

  return input;
}

test("ResetPasswordForm updates the password and resets the form", async () => {
  const user = userEvent.setup();
  const { container, getByRole } = renderWithMantine(<ResetPasswordForm />);
  const newPasswordInput = inputByName(container, "newPassword");
  const confirmPasswordInput = inputByName(container, "confirmPassword");

  await user.type(newPasswordInput, "NewPassw0rd1");
  await user.type(confirmPasswordInput, "NewPassw0rd1");
  await user.click(getByRole("button", { name: "パスワードを更新" }));

  await vi.waitFor(() => {
    expect(resetPasswordMock).toHaveBeenCalledWith({
      newPassword: "NewPassw0rd1",
      token: "reset-token",
    });
  });
  await vi.waitFor(() => {
    expect(newPasswordInput.value).toBe("");
    expect(confirmPasswordInput.value).toBe("");
  });
  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "green",
    message: "パスワードを更新しました",
    title: "更新完了",
  });
  expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
});

test("ResetPasswordForm reports update errors", async () => {
  const user = userEvent.setup();
  resetPasswordMock.mockRejectedValueOnce(new ConvexError("RESET_TOKEN_INVALID"));
  const { container, getByRole } = renderWithMantine(<ResetPasswordForm />);

  await user.type(inputByName(container, "newPassword"), "NewPassw0rd1");
  await user.type(inputByName(container, "confirmPassword"), "NewPassw0rd1");
  await user.click(getByRole("button", { name: "パスワードを更新" }));

  await vi.waitFor(() => {
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: "red",
      message: "RESET_TOKEN_INVALID",
      title: "更新エラー",
    });
  });
});

test("ResetPasswordForm disables submission without a token", () => {
  routeSearchState.value = { token: "" };
  const { getByRole } = renderWithMantine(<ResetPasswordForm />);
  const submitButton = getByRole("button", { name: "パスワードを更新" }) as HTMLButtonElement;

  expect(submitButton.disabled).toBe(true);
});
