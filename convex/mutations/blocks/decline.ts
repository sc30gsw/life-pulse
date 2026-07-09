import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { decline as declineBlock } from "../../services/blocks/decline";

export const decline = mutation({
  args: {
    blockId: v.id("studyBlocks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await declineBlock(ctx, user, args));

    return null;
  },
});
