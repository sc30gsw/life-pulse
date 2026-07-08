import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { archive as archiveDogTask } from "../../services/dogTasks/archive";

export const archive = mutation({
  args: { taskId: v.id("dogTasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await archiveDogTask(ctx, args);

    return null;
  },
});
