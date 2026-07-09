import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { studyBlockFieldValidators } from "../../lib/validators";
import { update as updateBlock } from "../../services/blocks/update";

export const update = mutation({
  args: {
    blockId: v.id("studyBlocks"),
    categoryId: v.id("studyCategories"),
    dateJst: studyBlockFieldValidators.dateJst,
    endHm: studyBlockFieldValidators.endHm,
    startHm: studyBlockFieldValidators.startHm,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await updateBlock(ctx, user, args));

    return null;
  },
});
