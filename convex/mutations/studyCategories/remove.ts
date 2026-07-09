import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { remove as removeStudyCategory } from "../../services/studyCategories/remove";

export const remove = mutation({
  args: { categoryId: v.id("studyCategories") },
  returns: v.union(v.literal("archived"), v.literal("deleted")),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return unwrapConvexResult(await removeStudyCategory(ctx, user, args));
  },
});
