import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "~/features/auth/schemas/password-reset-schema";

test("ForgotPasswordSchema accepts a valid email", () => {
  expect(v.parse(ForgotPasswordSchema, { email: "user@example.com" })).toEqual({
    email: "user@example.com",
  });
});

test("ForgotPasswordSchema rejects a malformed email", () => {
  expect(() => v.parse(ForgotPasswordSchema, { email: "not-an-email" })).toThrow(
    "有効なメールアドレスを入力してください",
  );
});

test("ResetPasswordSchema accepts a strong matching password", () => {
  expect(
    v.parse(ResetPasswordSchema, {
      confirmPassword: "NewPassw0rd1",
      newPassword: "NewPassw0rd1",
    }),
  ).toEqual({
    confirmPassword: "NewPassw0rd1",
    newPassword: "NewPassw0rd1",
  });
});

test("ResetPasswordSchema rejects mismatched confirmation", () => {
  expect(() =>
    v.parse(ResetPasswordSchema, {
      confirmPassword: "DifferentPassw0rd1",
      newPassword: "NewPassw0rd1",
    }),
  ).toThrow("パスワードが一致しません");
});
