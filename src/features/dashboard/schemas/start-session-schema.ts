import * as v from "valibot";

export const StartSessionSchema = v.object({
  categoryId: v.pipe(v.string(), v.minLength(1, "カテゴリを選択してください")),
  plannedMinutes: v.optional(v.pipe(v.number(), v.minValue(1, "1分以上で入力してください"))),
});

export type StartSessionInput = v.InferOutput<typeof StartSessionSchema>;
