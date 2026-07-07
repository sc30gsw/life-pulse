import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { erosionReasonValidator } from "../../lib/validators";
import { erode as erodeBlock } from "../../services/blocks/erode";

export const erode = mutation({
  args: {
    blockId: v.id("studyBlocks"),
    reason: erosionReasonValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await erodeBlock(ctx, user, args);

    return null;
  },
});
