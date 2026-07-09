"use node";

import { createHash, randomInt } from "node:crypto";

import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { createElement } from "react";
import { render, toPlainText } from "react-email";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { action, env } from "../../_generated/server";
import { OtpEmail } from "../../emails/otpEmail";
import { AUTH_SECOND_FACTOR_SIGNIN_PURPOSE } from "../../lib/domain";
import { resend } from "../../resend";
import {
  AUTH_EMAIL_SUBJECTS,
  AUTH_ENV,
  SECOND_FACTOR_OTP_EXPIRES_IN_MINUTES,
  SECOND_FACTOR_OTP_LENGTH,
} from "../../services/auth/constants";

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

export const sendSecondFactorOtp = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [authUserId, sessionId] = await Promise.all([getAuthUserId(ctx), getAuthSessionId(ctx)]);

    if (authUserId === null || sessionId === null) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    const email = await ctx.runQuery(internal.queries.auth.getAuthUserEmail.getAuthUserEmail, {
      authUserId,
    });

    if (email === null) {
      throw new ConvexError("EMAIL_NOT_FOUND");
    }

    const code = randomInt(0, 10 ** SECOND_FACTOR_OTP_LENGTH)
      .toString()
      .padStart(SECOND_FACTOR_OTP_LENGTH, "0");
    const challengeId = await ctx.runMutation(
      internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge,
      {
        authUserId,
        codeHash: hashSecret(code),
        email,
        now: Date.now(),
        purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
        sessionId,
      },
    );
    const emailElement = createElement(OtpEmail, {
      code,
      expiresInMinutes: SECOND_FACTOR_OTP_EXPIRES_IN_MINUTES,
    });
    const html = await render(emailElement);
    const text = toPlainText(html);
    const emailId = await resend.sendEmail(ctx, {
      from: requiredEnv(env.RESEND_FROM, AUTH_ENV.resendFrom as keyof typeof AUTH_ENV),
      html,
      replyTo: [requiredEnv(env.RESEND_REPLY_TO, AUTH_ENV.resendReplyTo as keyof typeof AUTH_ENV)],
      subject: AUTH_EMAIL_SUBJECTS.secondFactorOtp,
      text,
      to: email,
    });

    await ctx.runMutation(
      internal.mutations.auth.setSecondFactorChallengeEmailId.setSecondFactorChallengeEmailId,
      { challengeId, emailId },
    );

    return null;
  },
});
