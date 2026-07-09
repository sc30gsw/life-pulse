import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { dogTaskFieldValidators } from "../../lib/validators";
import { rename as renameDogTask } from "../../services/dogTasks/rename";

export const rename = mutation({
  args: { name: dogTaskFieldValidators.name, taskId: v.id("dogTasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    unwrapConvexResult(await renameDogTask(ctx, args));

    return null;
  },
});
