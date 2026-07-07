import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { advancePhase as advanceFastingPhase } from "../../services/fasting/advancePhase";

export const advancePhase = internalMutation({
  args: { to: v.union(v.literal("fatburn"), v.literal("goal")), windowId: v.id("fastingWindows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await advanceFastingPhase(ctx, args);

    return null;
  },
});
