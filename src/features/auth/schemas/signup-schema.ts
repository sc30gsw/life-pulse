import * as v from "valibot";

const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(12, "パスワードは12文字以上で入力してください"),
  v.regex(/[a-z]/, "パスワードには英小文字を含めてください"),
  v.regex(/[A-Z]/, "パスワードには英大文字を含めてください"),
  v.regex(/\d/, "パスワードには数字を含めてください"),
);

export const SignupSchema = v.pipe(
  v.object({
    confirmPassword: v.pipe(v.string(), v.minLength(1, "確認用パスワードを入力してください")),
    displayName: v.pipe(v.string(), v.minLength(1, "表示名を入力してください")),
    email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
    password: PasswordSchema,
    role: v.picklist(["self", "partner"], "ロールを選択してください"),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "パスワードが一致しません",
    ),
    ["confirmPassword"],
  ),
);

export type SignupInput = v.InferOutput<typeof SignupSchema>;
