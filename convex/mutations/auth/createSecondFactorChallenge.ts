import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { authSecondFactorPurposeValidator } from "../../lib/validators";
import { createSecondFactorChallenge as createSecondFactorChallengeService } from "../../services/auth/secondFactor";

export const createSecondFactorChallenge = internalMutation({
  args: {
    authUserId: v.id("users"),
    codeHash: v.string(),
    email: v.string(),
    now: v.number(),
    purpose: authSecondFactorPurposeValidator,
    sessionId: v.id("authSessions"),
  },
  returns: v.id("authSecondFactorChallenges"),
  handler: async (ctx, args) =>
    unwrapConvexResult(await createSecondFactorChallengeService(ctx, args)),
});
