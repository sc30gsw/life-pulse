"use node";

import { createHash } from "node:crypto";

import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { action, env } from "../../_generated/server";
import { AUTH_ENV } from "../../services/auth/constants";

function requiredEnv(value: string | undefined, name: keyof typeof AUTH_ENV) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function hashSecret(value: Doc<"authSecondFactorChallenges">["codeHash"]) {
  return createHash("sha256")
    .update(
      `${value}:${requiredEnv(env.AUTH_OTP_PEPPER, AUTH_ENV.otpPepper as keyof typeof AUTH_ENV)}`,
    )
    .digest("hex");
}

export const verifySecondFactorOtp = action({
  args: { code: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [authUserId, sessionId] = await Promise.all([getAuthUserId(ctx), getAuthSessionId(ctx)]);

    if (authUserId === null || sessionId === null) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    const result = await ctx.runMutation(
      internal.mutations.auth.verifySecondFactorChallenge.verifySecondFactorChallenge,
      {
        authUserId,
        codeHash: hashSecret(args.code),
        now: Date.now(),
        sessionId,
      },
    );

    if (!result.ok) {
      throw new ConvexError(result.code);
    }

    return null;
  },
});
