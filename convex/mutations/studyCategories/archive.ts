import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { archive as archiveStudyCategory } from "../../services/studyCategories/archive";

export const archive = mutation({
  args: { categoryId: v.id("studyCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await archiveStudyCategory(ctx, user, args);

    return null;
  },
});
