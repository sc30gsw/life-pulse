import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { healthSourceValidator } from "../../lib/validators";
import { health as healthService } from "../../services/dashboard/health";

export const health = query({
  args: { dateJst: v.string() },
  returns: v.union(
    v.null(),
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
    await requireUser(ctx);

    return await healthService(ctx, args);
  },
});
