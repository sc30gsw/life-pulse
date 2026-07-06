// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { SignupForm } from "~/features/auth/components/signup-form";
import { renderWithMantine } from "~/test-utils";

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: signInMock, signOut: vi.fn() }),
}));

test("renders every signup field with a submit button", () => {
  const { getByLabelText, getByRole } = renderWithMantine(<SignupForm />);

  expect(getByLabelText(/メールアドレス/)).toBeDefined();
  expect(getByLabelText(/表示名/)).toBeDefined();
  expect(getByRole("combobox", { name: /ロール/ })).toBeDefined();
  expect(getByLabelText(/^パスワード(\s|$)/)).toBeDefined();
  expect(getByLabelText(/パスワード\(確認\)/)).toBeDefined();
  expect(getByRole("button", { name: "アカウント作成" })).toBeDefined();
});

test("shows a validation error and does not call signIn on a weak password", async () => {
  signInMock.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, findByText } = renderWithMantine(<SignupForm />);

  await user.type(getByLabelText(/^パスワード(\s|$)/), "short1A");
  await user.tab();

  expect(await findByText("パスワードは12文字以上で入力してください")).toBeDefined();
  expect(signInMock).not.toHaveBeenCalled();
});

test("calls signIn with password flow, displayName and role on valid submit", async () => {
  signInMock.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<SignupForm />);

  await user.type(getByLabelText(/メールアドレス/), "user@example.com");
  await user.type(getByLabelText(/表示名/), "テスト太郎");
  await user.click(getByRole("combobox", { name: /ロール/ }));
  //* Mantine's dropdown is positioned by Floating UI, which cannot measure
  //* layout in happy-dom and leaves the popover at `display: none`; query
  //* with `hidden: true` to reach the option anyway.
  await user.click(getByRole("option", { hidden: true, name: "本人" }));
  await user.type(getByLabelText(/^パスワード(\s|$)/), "Password1234");
  await user.type(getByLabelText(/パスワード\(確認\)/), "Password1234");
  await user.click(getByRole("button", { name: "アカウント作成" }));

  await vi.waitFor(() => {
    expect(signInMock).toHaveBeenCalledWith("password", {
      displayName: "テスト太郎",
      email: "user@example.com",
      flow: "signUp",
      password: "Password1234",
      role: "self",
    });
  });
});
