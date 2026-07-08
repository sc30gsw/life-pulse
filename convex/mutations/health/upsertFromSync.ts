import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { upsertFromSync as upsertFromSyncHealth } from "../../services/health/upsertFromSync";

// internalMutation (CVX-01/05): written to only by
// convex/actions/garmin/syncDaily.ts ("use node" internalAction, plan Step 6)
// — never exposed to the client.
export const upsertFromSync = internalMutation({
  args: {
    days: v.array(
      v.object({
        bodyBattery: v.optional(v.number()),
        dateJst: v.string(),
        hrv: v.optional(v.number()),
        restingHr: v.optional(v.number()),
        sleepMinutes: v.optional(v.number()),
        sleepScore: v.optional(v.number()),
        steps: v.optional(v.number()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsertFromSyncHealth(ctx, args);

    return null;
  },
});
