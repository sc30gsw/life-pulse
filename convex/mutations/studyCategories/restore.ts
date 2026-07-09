import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { restore as restoreStudyCategory } from "../../services/studyCategories/restore";

export const restore = mutation({
  args: { categoryId: v.id("studyCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await restoreStudyCategory(ctx, user, args));

    return null;
  },
});
