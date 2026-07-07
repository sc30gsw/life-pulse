import * as v from "valibot";

import { CATEGORY_LABELS, type SessionCategory } from "~/types/dashboard";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];

export const StartSessionSchema = v.object({
  category: v.picklist(CATEGORY_VALUES),
  plannedMinutes: v.optional(v.pipe(v.number(), v.minValue(1, "1分以上で入力してください"))),
});

export type StartSessionInput = v.InferOutput<typeof StartSessionSchema>;
