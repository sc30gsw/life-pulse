import * as v from "valibot";

const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(12, "パスワードは12文字以上で入力してください"),
  v.regex(/[a-z]/, "パスワードには英小文字を含めてください"),
  v.regex(/[A-Z]/, "パスワードには英大文字を含めてください"),
  v.regex(/\d/, "パスワードには数字を含めてください"),
);

export const DisplayNameSchema = v.object({
  displayName: v.pipe(v.string(), v.trim(), v.minLength(1, "表示名を入力してください")),
});

export const EmailChangeSchema = v.object({
  currentPassword: v.pipe(v.string(), v.minLength(1, "現在のパスワードを入力してください")),
  newEmail: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
});

export const PasswordChangeSchema = v.pipe(
  v.object({
    confirmPassword: v.pipe(v.string(), v.minLength(1, "確認用パスワードを入力してください")),
    currentPassword: v.pipe(v.string(), v.minLength(1, "現在のパスワードを入力してください")),
    newPassword: PasswordSchema,
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      "パスワードが一致しません",
    ),
    ["confirmPassword"],
  ),
);
