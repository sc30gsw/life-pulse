import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { upsertManual as upsertManualHealth } from "../../services/health/upsertManual";

export const upsertManual = mutation({
  args: {
    bodyBattery: v.optional(v.number()),
    dateJst: v.string(),
    hrv: v.optional(v.number()),
    restingHr: v.optional(v.number()),
    sleepMinutes: v.optional(v.number()),
    sleepScore: v.optional(v.number()),
    steps: v.optional(v.number()),
    todayJst: v.string(),
  },
  returns: v.id("healthMetrics"),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await upsertManualHealth(ctx, args);
  },
});
