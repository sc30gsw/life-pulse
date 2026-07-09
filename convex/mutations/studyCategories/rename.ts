import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { studyCategoryFieldValidators } from "../../lib/validators";
import { rename as renameStudyCategory } from "../../services/studyCategories/rename";

export const rename = mutation({
  args: { categoryId: v.id("studyCategories"), name: studyCategoryFieldValidators.name },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await renameStudyCategory(ctx, user, args));

    return null;
  },
});
