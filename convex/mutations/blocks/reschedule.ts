import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { studyBlockFieldValidators } from "../../lib/validators";
import { reschedule as rescheduleBlock } from "../../services/blocks/reschedule";

export const reschedule = mutation({
  args: {
    blockId: v.id("studyBlocks"),
    endHm: studyBlockFieldValidators.endHm,
    startHm: studyBlockFieldValidators.startHm,
  },
  returns: v.id("studyBlocks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await rescheduleBlock(ctx, user, args);
  },
});
