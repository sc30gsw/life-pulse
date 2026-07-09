import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { fastingWindowFieldValidators } from "../../lib/validators";
import { start as startFasting } from "../../services/fasting/start";

export const start = mutation({
  args: { targetMinutes: v.optional(fastingWindowFieldValidators.targetMinutes) },
  returns: v.id("fastingWindows"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return unwrapConvexResult(await startFasting(ctx, user, args));
  },
});
