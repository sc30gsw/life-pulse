import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { update as updateBlock } from "../../services/blocks/update";

export const update = mutation({
  args: {
    blockId: v.id("studyBlocks"),
    category: v.string(),
    dateJst: v.string(),
    endHm: v.string(),
    startHm: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await updateBlock(ctx, user, args);

    return null;
  },
});
