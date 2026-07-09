import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

export const setPasswordResetEmailId = internalMutation({
  args: { emailId: v.string(), resetTokenId: v.id("passwordResetTokens") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resetTokenId, { emailId: args.emailId });

    return null;
  },
});
