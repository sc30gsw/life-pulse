import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { scheduledFastingPhaseValidator } from "../../lib/validators";
import { advancePhase as advanceFastingPhase } from "../../services/fasting/advancePhase";

export const advancePhase = internalMutation({
  args: { to: scheduledFastingPhaseValidator, windowId: v.id("fastingWindows") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await advanceFastingPhase(ctx, args);

    return null;
  },
});
