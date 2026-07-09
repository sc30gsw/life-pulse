"use node";

import { createHash, randomBytes } from "node:crypto";

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { createElement } from "react";
import { render, toPlainText } from "react-email";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { action, env } from "../../_generated/server";
import { EmailChangeConfirmationEmail } from "../../emails/emailChangeConfirmationEmail";
import { resend } from "../../resend";
import {
  AUTH_EMAIL_SUBJECTS,
  AUTH_ENV,
  EMAIL_CHANGE_EXPIRES_IN_MINUTES,
} from "../../services/auth/constants";

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

export const requestEmailChange = action({
  args: { newEmail: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);

    if (authUserId === null) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    await ctx.runQuery(internal.queries.users.getEmailForCaller.getEmailForCaller, {
      authUserId,
    });

    const token = randomBytes(32).toString("base64url");
    const tokenId = await ctx.runMutation(
      internal.mutations.users.createEmailChangeToken.createEmailChangeToken,
      {
        authUserId,
        newEmail: args.newEmail,
        now: Date.now(),
        tokenHash: hashSecret(token),
      },
    );
    const confirmationUrl = `${requiredEnv(env.APP_BASE_URL, AUTH_ENV.appBaseUrl as keyof typeof AUTH_ENV).replace(/\/$/, "")}/profile?emailChangeToken=${token}`;
    const emailElement = createElement(EmailChangeConfirmationEmail, {
      confirmationUrl,
      expiresInMinutes: EMAIL_CHANGE_EXPIRES_IN_MINUTES,
      newEmail: args.newEmail,
    });
    const html = await render(emailElement);
    const text = toPlainText(html);
    const emailId = await resend.sendEmail(ctx, {
      from: requiredEnv(env.RESEND_FROM, AUTH_ENV.resendFrom as keyof typeof AUTH_ENV),
      html,
      replyTo: [requiredEnv(env.RESEND_REPLY_TO, AUTH_ENV.resendReplyTo as keyof typeof AUTH_ENV)],
      subject: AUTH_EMAIL_SUBJECTS.emailChange,
      text,
      to: args.newEmail,
    });

    await ctx.runMutation(
      internal.mutations.users.setEmailChangeTokenEmailId.setEmailChangeTokenEmailId,
      { emailId, tokenId },
    );

    return null;
  },
});
