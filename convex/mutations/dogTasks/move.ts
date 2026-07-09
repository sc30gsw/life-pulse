import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { dogTaskMoveDirectionValidator } from "../../lib/validators";
import { move as moveDogTask } from "../../services/dogTasks/move";

export const move = mutation({
  args: {
    direction: v.optional(dogTaskMoveDirectionValidator),
    targetTaskId: v.optional(v.id("dogTasks")),
    taskId: v.id("dogTasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    unwrapConvexResult(await moveDogTask(ctx, args));

    return null;
  },
});
