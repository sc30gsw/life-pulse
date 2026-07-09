import { Result } from "better-result";
import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { authFlowErrorCodeValidator } from "../../lib/validators";
import type { AuthFlowErrorCode } from "../../services/auth/errors";
import { verifySecondFactorChallenge as verifySecondFactorChallengeService } from "../../services/auth/secondFactor";

type VerifySecondFactorChallengeResult = { ok: true } | { code: AuthFlowErrorCode; ok: false };

export const verifySecondFactorChallenge = internalMutation({
  args: {
    authUserId: v.id("users"),
    codeHash: v.string(),
    now: v.number(),
    sessionId: v.id("authSessions"),
  },
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({ code: authFlowErrorCodeValidator, ok: v.literal(false) }),
  ),
  handler: async (ctx, args): Promise<VerifySecondFactorChallengeResult> => {
    const result = await verifySecondFactorChallengeService(ctx, args);

    if (Result.isError(result)) {
      return { code: result.error.code, ok: false };
    }

    return { ok: true };
  },
});
