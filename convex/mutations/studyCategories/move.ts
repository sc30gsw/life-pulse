import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogTaskMoveDirectionValidator } from "../../lib/validators";
import { move as moveStudyCategory } from "../../services/studyCategories/move";

export const move = mutation({
  args: {
    categoryId: v.id("studyCategories"),
    direction: v.optional(dogTaskMoveDirectionValidator),
    targetCategoryId: v.optional(v.id("studyCategories")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await moveStudyCategory(ctx, user, args);

    return null;
  },
});
