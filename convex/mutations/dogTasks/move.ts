import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { move as moveDogTask } from "../../services/dogTasks/move";

export const move = mutation({
  args: { direction: v.union(v.literal("up"), v.literal("down")), taskId: v.id("dogTasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await moveDogTask(ctx, args);

    return null;
  },
});
