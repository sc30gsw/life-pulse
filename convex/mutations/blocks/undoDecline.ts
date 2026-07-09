import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { undoDecline as undoDeclineBlock } from "../../services/blocks/undoDecline";

export const undoDecline = mutation({
  args: {
    blockId: v.id("studyBlocks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await undoDeclineBlock(ctx, user, args));

    return null;
  },
});
