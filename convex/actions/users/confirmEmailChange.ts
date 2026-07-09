"use node";

import { createHash } from "node:crypto";

import { getAuthUserId } from "@convex-dev/auth/server";
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

function hashSecret(value: Doc<"emailChangeTokens">["tokenHash"]) {
  return createHash("sha256")
    .update(
      `${value}:${requiredEnv(env.AUTH_OTP_PEPPER, AUTH_ENV.otpPepper as keyof typeof AUTH_ENV)}`,
    )
    .digest("hex");
}

export const confirmEmailChange = action({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);

    if (authUserId === null) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    await ctx.runMutation(
      internal.mutations.users.confirmEmailChangeTokenAndApply.confirmEmailChangeTokenAndApply,
      {
        authUserId,
        now: Date.now(),
        tokenHash: hashSecret(args.token),
      },
    );

    return null;
  },
});
