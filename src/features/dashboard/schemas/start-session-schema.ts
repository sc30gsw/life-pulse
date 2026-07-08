import * as v from "valibot";

import { CATEGORY_VALUES } from "~/../convex/lib/domain";

export const StartSessionSchema = v.object({
  category: v.picklist(CATEGORY_VALUES),
  plannedMinutes: v.optional(v.pipe(v.number(), v.minValue(1, "1分以上で入力してください"))),
});

export type StartSessionInput = v.InferOutput<typeof StartSessionSchema>;
