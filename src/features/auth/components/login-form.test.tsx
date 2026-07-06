// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { LoginForm } from "~/features/auth/components/login-form";
import { renderWithMantine } from "~/test-utils";

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: signInMock, signOut: vi.fn() }),
}));

test("renders email and password inputs with a submit button", () => {
  const { getByLabelText, getByRole } = renderWithMantine(<LoginForm />);

  expect(getByLabelText(/メールアドレス/)).toBeDefined();
  expect(getByLabelText(/パスワード/)).toBeDefined();
  expect(getByRole("button", { name: "ログイン" })).toBeDefined();
});

test("shows a validation error when the email is malformed", async () => {
  const user = userEvent.setup();
  const { getByLabelText, findByText } = renderWithMantine(<LoginForm />);

  await user.type(getByLabelText(/メールアドレス/), "not-an-email");
  await user.tab();

  expect(await findByText("有効なメールアドレスを入力してください")).toBeDefined();
});

test("calls signIn with password flow on valid submit", async () => {
  signInMock.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<LoginForm />);

  await user.type(getByLabelText(/メールアドレス/), "user@example.com");
  await user.type(getByLabelText(/パスワード/), "anything");
  await user.click(getByRole("button", { name: "ログイン" }));

  await vi.waitFor(() => {
    expect(signInMock).toHaveBeenCalledWith("password", {
      email: "user@example.com",
      flow: "signIn",
      password: "anything",
    });
  });
});
