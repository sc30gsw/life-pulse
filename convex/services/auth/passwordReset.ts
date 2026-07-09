import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { PASSWORD_RESET_TTL_MS } from "./constants";
import { AuthFlowError } from "./errors";

type AuthEmail = NonNullable<Doc<"users">["email"]>;

type CreatePasswordResetTokenArgs = {
  authUserId: Doc<"users">["_id"];
  email: AuthEmail;
  now: number;
  tokenHash: Doc<"passwordResetTokens">["tokenHash"];
};

type ConsumePasswordResetTokenArgs = {
  now: number;
  tokenHash: Doc<"passwordResetTokens">["tokenHash"];
};

type ConsumedPasswordResetToken = {
  authUserId: Doc<"users">["_id"];
  email: AuthEmail;
};

export async function createPasswordResetToken(
  ctx: MutationCtx,
  args: CreatePasswordResetTokenArgs,
): Promise<ResultType<Doc<"passwordResetTokens">["_id"], AuthFlowError>> {
  return Result.ok(
    await ctx.db.insert("passwordResetTokens", {
      authUserId: args.authUserId,
      email: args.email,
      expiresAt: args.now + PASSWORD_RESET_TTL_MS,
      tokenHash: args.tokenHash,
    }),
  );
}

export async function consumePasswordResetToken(
  ctx: MutationCtx,
  args: ConsumePasswordResetTokenArgs,
): Promise<ResultType<ConsumedPasswordResetToken, AuthFlowError>> {
  const token = await ctx.db
    .query("passwordResetTokens")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
    .unique();

  if (token === null || token.consumedAt !== undefined) {
    return Result.err(new AuthFlowError({ code: "RESET_TOKEN_INVALID" }));
  }

  if (token.expiresAt <= args.now) {
    await ctx.db.patch(token._id, { consumedAt: args.now });

    return Result.err(new AuthFlowError({ code: "RESET_TOKEN_EXPIRED" }));
  }

  await ctx.db.patch(token._id, { consumedAt: args.now });

  return Result.ok({ authUserId: token.authUserId, email: token.email });
}
