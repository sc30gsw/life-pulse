import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
  password: v.pipe(v.string(), v.minLength(1, "パスワードを入力してください")),
});
