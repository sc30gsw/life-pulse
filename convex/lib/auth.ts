import { getAuthUserId } from "@convex-dev/auth/server";
import { Result, TaggedError, type Result as ResultType } from "better-result";

import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { unwrapConvexResult } from "./result";

class AuthGuardError extends TaggedError("AuthGuardError")<{
  code: "FORBIDDEN" | "UNAUTHENTICATED";
  message: string;
}>() {
  constructor(code: "FORBIDDEN" | "UNAUTHENTICATED") {
    super({ code, message: code });
  }
}

export async function requireUserResult(
  ctx: QueryCtx | MutationCtx,
): Promise<ResultType<Doc<"appUsers">, AuthGuardError>> {
  const authSubject = await getAuthUserId(ctx);

  if (authSubject === null) {
    return Result.err(new AuthGuardError("UNAUTHENTICATED"));
  }

  const user = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authSubject))
    .unique();

  if (user === null) {
    return Result.err(new AuthGuardError("UNAUTHENTICATED"));
  }

  return Result.ok(user);
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  return unwrapConvexResult(await requireUserResult(ctx));
}

export async function requireSelfResult(
  ctx: QueryCtx | MutationCtx,
): Promise<ResultType<Doc<"appUsers">, AuthGuardError>> {
  const userResult = await requireUserResult(ctx);

  if (Result.isError(userResult)) {
    return Result.err(userResult.error);
  }

  const user = userResult.value;

  if (user.role !== "self") {
    return Result.err(new AuthGuardError("FORBIDDEN"));
  }

  return Result.ok(user);
}

export async function requireSelf(ctx: QueryCtx | MutationCtx) {
  return unwrapConvexResult(await requireSelfResult(ctx));
}
