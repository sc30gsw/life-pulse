import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";

export const generateAvatarUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // requireUser: any authenticated user may generate an upload URL for
    // their own avatar (self AND partner both edit their own /profile — not
    // a role gate, see FR-10).
    await requireUser(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});
