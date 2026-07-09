import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { dogTaskFieldValidators } from "../../lib/validators";
import { create as createDogTask } from "../../services/dogTasks/create";

export const create = mutation({
  args: { name: dogTaskFieldValidators.name },
  returns: v.id("dogTasks"),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return unwrapConvexResult(await createDogTask(ctx, args));
  },
});
