import * as v from "valibot";

export const UpdateSettingsSchema = v.object({
  dogName: v.pipe(
    v.string("犬の名前を入力してください"),
    v.minLength(1, "犬の名前を入力してください"),
  ),
  fastingDefaultMinutes: v.pipe(
    v.number("断食目標時間を入力してください"),
    v.integer("整数で入力してください"),
    v.minValue(1, "1分以上で入力してください"),
  ),
});

export type UpdateSettingsInput = v.InferOutput<typeof UpdateSettingsSchema>;
export type UpdateSettingsFormInput = v.InferInput<typeof UpdateSettingsSchema>;
