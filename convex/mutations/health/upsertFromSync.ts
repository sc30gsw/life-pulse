import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { healthMetricFieldValidators } from "../../lib/validators";
import { upsertFromSync as upsertFromSyncHealth } from "../../services/health/upsertFromSync";

// internalMutation (CVX-01/05): written to only by
// convex/actions/garmin/syncDaily.ts ("use node" internalAction, plan Step 6)
// — never exposed to the client.
export const upsertFromSync = internalMutation({
  args: {
    days: v.array(
      v.object({
        bodyBattery: healthMetricFieldValidators.bodyBattery,
        dateJst: healthMetricFieldValidators.dateJst,
        hrv: healthMetricFieldValidators.hrv,
        restingHr: healthMetricFieldValidators.restingHr,
        sleepMinutes: healthMetricFieldValidators.sleepMinutes,
        sleepScore: healthMetricFieldValidators.sleepScore,
        steps: healthMetricFieldValidators.steps,
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsertFromSyncHealth(ctx, args);

    return null;
  },
});
