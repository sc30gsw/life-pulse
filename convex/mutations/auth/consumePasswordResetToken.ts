import { Result } from "better-result";
import { v } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";
import { authFlowErrorCodeValidator } from "../../lib/validators";
import type { AuthFlowErrorCode } from "../../services/auth/errors";
import { consumePasswordResetToken as consumePasswordResetTokenService } from "../../services/auth/passwordReset";

type ConsumePasswordResetTokenResult =
  | { ok: true; token: { authUserId: Id<"users">; email: Doc<"passwordResetTokens">["email"] } }
  | { code: AuthFlowErrorCode; ok: false };

export const consumePasswordResetToken = internalMutation({
  args: { now: v.number(), tokenHash: v.string() },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      token: v.object({ authUserId: v.id("users"), email: v.string() }),
    }),
    v.object({ code: authFlowErrorCodeValidator, ok: v.literal(false) }),
  ),
  handler: async (ctx, args): Promise<ConsumePasswordResetTokenResult> => {
    const result = await consumePasswordResetTokenService(ctx, args);

    if (Result.isError(result)) {
      return { code: result.error.code, ok: false };
    }

    return { ok: true, token: result.value };
  },
});
