import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { remove as removeBlock } from "../../services/blocks/remove";

export const remove = mutation({
  args: {
    blockId: v.id("studyBlocks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await removeBlock(ctx, user, args));

    return null;
  },
});
