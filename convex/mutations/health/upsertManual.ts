import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { healthMetricFieldValidators } from "../../lib/validators";
import { upsertManual as upsertManualHealth } from "../../services/health/upsertManual";

export const upsertManual = mutation({
  args: {
    bodyBattery: healthMetricFieldValidators.bodyBattery,
    dateJst: healthMetricFieldValidators.dateJst,
    hrv: healthMetricFieldValidators.hrv,
    restingHr: healthMetricFieldValidators.restingHr,
    sleepMinutes: healthMetricFieldValidators.sleepMinutes,
    sleepScore: healthMetricFieldValidators.sleepScore,
    steps: healthMetricFieldValidators.steps,
    todayJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.id("healthMetrics"),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await upsertManualHealth(ctx, args);
  },
});
