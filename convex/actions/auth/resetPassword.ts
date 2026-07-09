"use node";

import { createHash } from "node:crypto";

import { invalidateSessions, modifyAccountCredentials } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { action, env } from "../../_generated/server";
import { validatePasswordRequirements } from "../../lib/passwordRequirements";
import { AUTH_ENV } from "../../services/auth/constants";

function requiredEnv(value: string | undefined, name: keyof typeof AUTH_ENV) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function hashSecret(value: Doc<"passwordResetTokens">["tokenHash"]) {
  return createHash("sha256")
    .update(
      `${value}:${requiredEnv(env.AUTH_OTP_PEPPER, AUTH_ENV.otpPepper as keyof typeof AUTH_ENV)}`,
    )
    .digest("hex");
}

export const resetPassword = action({
  args: { newPassword: v.string(), token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    validatePasswordRequirements(args.newPassword);

    const tokenResult = await ctx.runMutation(
      internal.mutations.auth.consumePasswordResetToken.consumePasswordResetToken,
      {
        now: Date.now(),
        tokenHash: hashSecret(args.token),
      },
    );

    if (!tokenResult.ok) {
      throw new ConvexError(tokenResult.code);
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: tokenResult.token.email, secret: args.newPassword },
    });
    await invalidateSessions(ctx, { userId: tokenResult.token.authUserId });

    return null;
  },
});
