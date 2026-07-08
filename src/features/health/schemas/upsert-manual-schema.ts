import * as v from "valibot";

import { DATE_JST_PATTERN } from "~/../convex/lib/domain";
import { todayJst } from "~/utils/date-jst";

export const UpsertManualSchema = v.pipe(
  v.object({
    bodyBattery: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
    dateJst: v.pipe(
      v.string("対象日を選択してください"),
      v.regex(DATE_JST_PATTERN, "対象日を選択してください"),
    ),
    hrv: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
    restingHr: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
    sleepMinutes: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
    sleepScore: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
    steps: v.optional(v.pipe(v.number(), v.minValue(0, "0以上で入力してください"))),
  }),
  v.forward(
    v.partialCheck([["dateJst"]], (input) => input.dateJst <= todayJst(), "未来日は入力できません"),
    ["dateJst"],
  ),
);

export type UpsertManualInput = v.InferOutput<typeof UpsertManualSchema>;
export type UpsertManualFormInput = v.InferInput<typeof UpsertManualSchema>;
