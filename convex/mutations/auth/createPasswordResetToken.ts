import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { createPasswordResetToken as createPasswordResetTokenService } from "../../services/auth/passwordReset";

export const createPasswordResetToken = internalMutation({
  args: {
    authUserId: v.id("users"),
    email: v.string(),
    now: v.number(),
    tokenHash: v.string(),
  },
  returns: v.id("passwordResetTokens"),
  handler: async (ctx, args) =>
    unwrapConvexResult(await createPasswordResetTokenService(ctx, args)),
});
