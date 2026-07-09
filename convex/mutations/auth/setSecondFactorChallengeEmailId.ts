import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

export const setSecondFactorChallengeEmailId = internalMutation({
  args: { challengeId: v.id("authSecondFactorChallenges"), emailId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.challengeId, { emailId: args.emailId });

    return null;
  },
});
