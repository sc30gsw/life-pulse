import * as v from "valibot";

export const StudyCategoryNameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "カテゴリ名を入力してください")),
});
