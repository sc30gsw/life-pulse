import * as v from "valibot";

export const StartFastingSchema = v.object({
  targetMinutes: v.optional(
    v.pipe(
      v.number(),
      v.integer("整数で入力してください"),
      v.minValue(1, "1分以上で入力してください"),
    ),
  ),
});

export type StartFastingInput = v.InferOutput<typeof StartFastingSchema>;
