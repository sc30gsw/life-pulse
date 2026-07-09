"use node";

import { createHash, randomBytes } from "node:crypto";

import { v } from "convex/values";
import { createElement } from "react";
import { render, toPlainText } from "react-email";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { action, env } from "../../_generated/server";
import { PasswordResetEmail } from "../../emails/passwordResetEmail";
import { resend } from "../../resend";
import {
  AUTH_EMAIL_SUBJECTS,
  AUTH_ENV,
  PASSWORD_RESET_EXPIRES_IN_MINUTES,
} from "../../services/auth/constants";

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

export const requestPasswordReset = action({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.queries.auth.getAuthUserByEmail.getAuthUserByEmail, {
      email: args.email,
    });

    if (user === null) {
      return null;
    }

    const token = randomBytes(32).toString("base64url");
    const resetTokenId = await ctx.runMutation(
      internal.mutations.auth.createPasswordResetToken.createPasswordResetToken,
      {
        authUserId: user.authUserId,
        email: user.email,
        now: Date.now(),
        tokenHash: hashSecret(token),
      },
    );
    const resetUrl = `${requiredEnv(env.APP_BASE_URL, AUTH_ENV.appBaseUrl as keyof typeof AUTH_ENV).replace(/\/$/, "")}/reset-password?token=${token}`;
    const emailElement = createElement(PasswordResetEmail, {
      expiresInMinutes: PASSWORD_RESET_EXPIRES_IN_MINUTES,
      resetUrl,
    });
    const html = await render(emailElement);
    const text = toPlainText(html);
    const emailId = await resend.sendEmail(ctx, {
      from: requiredEnv(env.RESEND_FROM, AUTH_ENV.resendFrom as keyof typeof AUTH_ENV),
      html,
      replyTo: [requiredEnv(env.RESEND_REPLY_TO, AUTH_ENV.resendReplyTo as keyof typeof AUTH_ENV)],
      subject: AUTH_EMAIL_SUBJECTS.passwordReset,
      text,
      to: user.email,
    });

    await ctx.runMutation(internal.mutations.auth.setPasswordResetEmailId.setPasswordResetEmailId, {
      emailId,
      resetTokenId,
    });

    return null;
  },
});
