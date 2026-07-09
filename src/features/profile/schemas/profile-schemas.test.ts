import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import {
  DisplayNameSchema,
  EmailChangeSchema,
  PasswordChangeSchema,
} from "~/features/profile/schemas/profile-schemas";

test("DisplayNameSchema trims a non-empty display name", () => {
  expect(v.parse(DisplayNameSchema, { displayName: " 本人 " })).toEqual({ displayName: "本人" });
});

test("DisplayNameSchema rejects a blank display name", () => {
  expect(() => v.parse(DisplayNameSchema, { displayName: " " })).toThrow(
    "表示名を入力してください",
  );
});

test("EmailChangeSchema accepts a valid email with current password", () => {
  expect(
    v.parse(EmailChangeSchema, {
      currentPassword: "OldPassw0rd1",
      newEmail: "new@example.com",
    }),
  ).toEqual({ currentPassword: "OldPassw0rd1", newEmail: "new@example.com" });
});

test("EmailChangeSchema rejects invalid email", () => {
  expect(() =>
    v.parse(EmailChangeSchema, { currentPassword: "OldPassw0rd1", newEmail: "invalid" }),
  ).toThrow("有効なメールアドレスを入力してください");
});

test("PasswordChangeSchema accepts a strong matching password", () => {
  expect(
    v.parse(PasswordChangeSchema, {
      confirmPassword: "NewPassw0rd1",
      currentPassword: "OldPassw0rd1",
      newPassword: "NewPassw0rd1",
    }),
  ).toEqual({
    confirmPassword: "NewPassw0rd1",
    currentPassword: "OldPassw0rd1",
    newPassword: "NewPassw0rd1",
  });
});

test("PasswordChangeSchema rejects mismatched confirmation", () => {
  expect(() =>
    v.parse(PasswordChangeSchema, {
      confirmPassword: "DifferentPassw0rd1",
      currentPassword: "OldPassw0rd1",
      newPassword: "NewPassw0rd1",
    }),
  ).toThrow("パスワードが一致しません");
});
