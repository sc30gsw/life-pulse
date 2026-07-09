import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

export const setEmailChangeTokenEmailId = internalMutation({
  args: { emailId: v.string(), tokenId: v.id("emailChangeTokens") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, { emailId: args.emailId });

    return null;
  },
});
