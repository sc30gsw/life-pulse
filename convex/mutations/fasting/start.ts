import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { start as startFasting } from "../../services/fasting/start";

export const start = mutation({
  args: { targetMinutes: v.optional(v.number()) },
  returns: v.id("fastingWindows"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await startFasting(ctx, user, args);
  },
});
