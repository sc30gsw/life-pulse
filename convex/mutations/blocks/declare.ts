import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studyBlockFieldValidators } from "../../lib/validators";
import { declare as declareBlock } from "../../services/blocks/declare";

export const declare = mutation({
  args: {
    category: studyBlockFieldValidators.category,
    dateJst: studyBlockFieldValidators.dateJst,
    endHm: studyBlockFieldValidators.endHm,
    startHm: studyBlockFieldValidators.startHm,
  },
  returns: v.id("studyBlocks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await declareBlock(ctx, user, args);
  },
});
