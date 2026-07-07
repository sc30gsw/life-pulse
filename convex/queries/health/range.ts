import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { healthSourceValidator } from "../../lib/validators";
import { range as rangeService } from "../../services/health/range";

export const range = query({
  args: { fromDateJst: v.string(), toDateJst: v.string() },
  returns: v.array(
    v.object({
      _creationTime: v.number(),
      _id: v.id("healthMetrics"),
      bodyBattery: v.optional(v.number()),
      dateJst: v.string(),
      hrv: v.optional(v.number()),
      restingHr: v.optional(v.number()),
      sleepMinutes: v.optional(v.number()),
      sleepScore: v.optional(v.number()),
      source: healthSourceValidator,
      steps: v.optional(v.number()),
      syncedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await rangeService(ctx, args);
  },
});
