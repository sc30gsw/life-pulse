import * as v from "valibot";

import { MAX_FASTING_TARGET_MINUTES } from "~/features/fasting/constants/fasting-target";

export const UpdateSettingsSchema = v.object({
  fastingDefaultMinutes: v.pipe(
    v.number("断食目標時間を入力してください"),
    v.integer("整数で入力してください"),
    v.minValue(1, "1分以上で入力してください"),
    v.maxValue(MAX_FASTING_TARGET_MINUTES, "16時間以下で入力してください"),
  ),
});

export type UpdateSettingsInput = v.InferOutput<typeof UpdateSettingsSchema>;
export type UpdateSettingsFormInput = v.InferInput<typeof UpdateSettingsSchema>;
