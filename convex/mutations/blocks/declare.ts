import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { declare as declareBlock } from "../../services/blocks/declare";

export const declare = mutation({
  args: {
    category: v.string(),
    dateJst: v.string(),
    endHm: v.string(),
    startHm: v.string(),
  },
  returns: v.id("studyBlocks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await declareBlock(ctx, user, args);
  },
});
