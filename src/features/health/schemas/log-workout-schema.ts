import * as v from "valibot";

import { DATE_TIME_PATTERN, WORKOUT_KIND_VALUES } from "~/../convex/lib/domain";
import { dayjs } from "~/utils/dayjs";

export const LogWorkoutSchema = v.pipe(
  v.object({
    at: v.pipe(
      v.string("日時を選択してください"),
      v.regex(DATE_TIME_PATTERN, "日時を選択してください"),
    ),
    durationMinutes: v.pipe(
      v.number("時間(分)を入力してください"),
      v.integer("整数で入力してください"),
      v.minValue(1, "1分以上で入力してください"),
    ),
    kind: v.picklist(WORKOUT_KIND_VALUES, "種別を選択してください"),
    perceivedIntensity: v.optional(
      v.pipe(
        v.number(),
        v.integer("整数で入力してください"),
        v.minValue(1, "1以上で入力してください"),
        v.maxValue(10, "10以下で入力してください"),
      ),
    ),
  }),
  v.transform((input) => ({
    at: dayjs.tz(input.at, "Asia/Tokyo").valueOf(),
    durationMinutes: input.durationMinutes,
    kind: input.kind,
    perceivedIntensity: input.perceivedIntensity,
  })),
);

export type LogWorkoutFormInput = v.InferInput<typeof LogWorkoutSchema>;
