import { Result, type Result as ResultType } from "better-result";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { EMAIL_CHANGE_TTL_MS } from "../auth/constants";
import { applyEmailChange } from "./applyEmailChange";
import { UserError } from "./errors";

type CreateEmailChangeTokenArgs = {
  authUserId: Id<"users">;
  newEmail: NonNullable<Doc<"users">["email"]>;
  now: number;
  tokenHash: Doc<"emailChangeTokens">["tokenHash"];
};

type ConfirmEmailChangeTokenArgs = {
  authUserId: Id<"users">;
  now: number;
  tokenHash: Doc<"emailChangeTokens">["tokenHash"];
};

export async function createEmailChangeToken(
  ctx: MutationCtx,
  args: CreateEmailChangeTokenArgs,
): Promise<ResultType<Id<"emailChangeTokens">, UserError>> {
  const existing = await ctx.db
    .query("emailChangeTokens")
    .withIndex("by_authUser", (q) => q.eq("authUserId", args.authUserId))
    .take(50);

  await Promise.all(
    existing
      .filter((token) => token.consumedAt === undefined)
      .map((token) => ctx.db.patch(token._id, { consumedAt: args.now })),
  );

  return Result.ok(
    await ctx.db.insert("emailChangeTokens", {
      authUserId: args.authUserId,
      expiresAt: args.now + EMAIL_CHANGE_TTL_MS,
      newEmail: args.newEmail,
      tokenHash: args.tokenHash,
    }),
  );
}

export async function confirmEmailChangeTokenAndApply(
  ctx: MutationCtx,
  args: ConfirmEmailChangeTokenArgs,
): Promise<ResultType<void, UserError>> {
  const token = await ctx.db
    .query("emailChangeTokens")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
    .unique();

  if (token === null || token.consumedAt !== undefined) {
    return Result.err(new UserError({ code: "EMAIL_CHANGE_TOKEN_INVALID" }));
  }

  if (token.authUserId !== args.authUserId) {
    return Result.err(new UserError({ code: "EMAIL_CHANGE_TOKEN_NOT_OWNED" }));
  }

  if (token.expiresAt <= args.now) {
    await ctx.db.patch(token._id, { consumedAt: args.now });

    return Result.err(new UserError({ code: "EMAIL_CHANGE_TOKEN_EXPIRED" }));
  }

  const applyResult = await applyEmailChange(ctx, {
    authUserId: token.authUserId,
    newEmail: token.newEmail,
  });

  if (Result.isError(applyResult)) {
    return Result.err(applyResult.error);
  }

  await ctx.db.patch(token._id, { consumedAt: args.now });

  return Result.ok();
}
