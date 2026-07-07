import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { categoryValidator } from "../../lib/validators";
import { start as startSession } from "../../services/sessions/start";

export const start = mutation({
  args: {
    blockId: v.optional(v.id("studyBlocks")),
    category: categoryValidator,
    dateJst: v.string(),
    plannedMinutes: v.optional(v.number()),
  },
  returns: v.id("studySessions"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await startSession(ctx, user, args);
  },
});
