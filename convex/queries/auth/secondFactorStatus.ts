import { v } from "convex/values";

import { query } from "../../_generated/server";
import { getCurrentAuthParts, isSecondFactorVerified } from "../../lib/auth";

export const secondFactorStatus = query({
  args: {},
  returns: v.object({
    required: v.boolean(),
    resendAvailableAt: v.union(v.null(), v.number()),
    verified: v.boolean(),
  }),
  handler: async (ctx) => {
    const auth = await getCurrentAuthParts(ctx);

    if (auth === null || auth.sessionId === null) {
      return { required: false, resendAvailableAt: null, verified: auth !== null };
    }

    const sessionId = auth.sessionId;
    const now = Date.now();
    const challenges = await ctx.db
      .query("authSecondFactorChallenges")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .take(20);
    const activeChallenge = challenges
      .reverse()
      .find((challenge) => challenge.consumedAt === undefined && challenge.expiresAt > now);

    return {
      required: true,
      resendAvailableAt: activeChallenge?.resendAvailableAt ?? null,
      verified: await isSecondFactorVerified(ctx, auth.authUserId, auth.sessionId),
    };
  },
});
