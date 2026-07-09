import * as v from "valibot";

const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(12, "パスワードは12文字以上で入力してください"),
  v.regex(/[a-z]/, "パスワードには英小文字を含めてください"),
  v.regex(/[A-Z]/, "パスワードには英大文字を含めてください"),
  v.regex(/\d/, "パスワードには数字を含めてください"),
);

export const ForgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
});
export type ForgotPasswordSchemaType = v.InferOutput<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = v.pipe(
  v.object({
    confirmPassword: v.pipe(v.string(), v.minLength(1, "確認用パスワードを入力してください")),
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
