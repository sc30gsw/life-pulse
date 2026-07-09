import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { studyCategoryFieldValidators } from "../../lib/validators";
import { create as createStudyCategory } from "../../services/studyCategories/create";

export const create = mutation({
  args: { name: studyCategoryFieldValidators.name },
  returns: v.id("studyCategories"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return unwrapConvexResult(await createStudyCategory(ctx, user, args));
  },
});
