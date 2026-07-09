import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { authSecondFactorPurposeValidator } from "../../lib/validators";
import {
  SECOND_FACTOR_MAX_ATTEMPTS,
  SECOND_FACTOR_OTP_TTL_MS,
  SECOND_FACTOR_RESEND_COOLDOWN_MS,
} from "./constants";
import { AuthFlowError } from "./errors";

type AuthEmail = NonNullable<Doc<"users">["email"]>;

type CreateSecondFactorChallengeArgs = {
  authUserId: Doc<"users">["_id"];
  codeHash: Doc<"authSecondFactorChallenges">["codeHash"];
  email: AuthEmail;
  now: number;
  purpose: typeof authSecondFactorPurposeValidator.type;
  sessionId: Doc<"authSessions">["_id"];
};

type VerifySecondFactorChallengeArgs = {
  authUserId: Doc<"users">["_id"];
  codeHash: Doc<"authSecondFactorChallenges">["codeHash"];
  now: number;
  sessionId: Doc<"authSessions">["_id"];
};

export async function createSecondFactorChallenge(
  ctx: MutationCtx,
  args: CreateSecondFactorChallengeArgs,
): Promise<ResultType<Doc<"authSecondFactorChallenges">["_id"], AuthFlowError>> {
  const recent = await ctx.db
    .query("authSecondFactorChallenges")
    .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
    .take(20);

  const active = recent.find(
    (challenge) => challenge.consumedAt === undefined && challenge.expiresAt > args.now,
  );

  if (active !== undefined && active.resendAvailableAt > args.now) {
    return Result.err(new AuthFlowError({ code: "OTP_RESEND_WAIT" }));
  }

  await Promise.all(
    recent
      .filter((challenge) => challenge.consumedAt === undefined)
      .map((challenge) => ctx.db.patch(challenge._id, { consumedAt: args.now })),
  );

  return Result.ok(
    await ctx.db.insert("authSecondFactorChallenges", {
      attemptCount: 0,
      authUserId: args.authUserId,
      codeHash: args.codeHash,
      email: args.email,
      expiresAt: args.now + SECOND_FACTOR_OTP_TTL_MS,
      purpose: args.purpose,
      resendAvailableAt: args.now + SECOND_FACTOR_RESEND_COOLDOWN_MS,
      sessionId: args.sessionId,
    }),
  );
}

export async function verifySecondFactorChallenge(
  ctx: MutationCtx,
  args: VerifySecondFactorChallengeArgs,
): Promise<ResultType<void, AuthFlowError>> {
  const challenges = await ctx.db
    .query("authSecondFactorChallenges")
    .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
    .take(20);
  const challenge = challenges
    .reverse()
    .find((row) => row.consumedAt === undefined && row.authUserId === args.authUserId);

  if (challenge === undefined) {
    return Result.err(new AuthFlowError({ code: "OTP_NOT_FOUND" }));
  }

  if (challenge.expiresAt <= args.now) {
    await ctx.db.patch(challenge._id, { consumedAt: args.now });

    return Result.err(new AuthFlowError({ code: "OTP_EXPIRED" }));
  }

  if (challenge.attemptCount >= SECOND_FACTOR_MAX_ATTEMPTS) {
    return Result.err(new AuthFlowError({ code: "OTP_ATTEMPTS_EXCEEDED" }));
  }

  if (challenge.codeHash !== args.codeHash) {
    await ctx.db.patch(challenge._id, { attemptCount: challenge.attemptCount + 1 });

    return Result.err(new AuthFlowError({ code: "OTP_INVALID" }));
  }

  const authSession = await ctx.db.get(args.sessionId);

  if (authSession === null || authSession.userId !== args.authUserId) {
    return Result.err(new AuthFlowError({ code: "OTP_SESSION_NOT_FOUND" }));
  }

  await ctx.db.patch(challenge._id, { consumedAt: args.now });

  const existing = await ctx.db
    .query("authSecondFactorSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
    .unique();

  const verified = {
    authUserId: args.authUserId,
    expiresAt: authSession.expirationTime,
    sessionId: args.sessionId,
    verifiedAt: args.now,
  };

  if (existing === null) {
    await ctx.db.insert("authSecondFactorSessions", verified);
  } else {
    await ctx.db.patch(existing._id, verified);
  }

  return Result.ok();
}
