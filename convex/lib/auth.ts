import { getAuthUserId } from "@convex-dev/auth/server";
import { Result, TaggedError, type Result as ResultType } from "better-result";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { unwrapConvexResult } from "./result";

class AuthGuardError extends TaggedError("AuthGuardError")<{
  code: "FORBIDDEN" | "SECOND_FACTOR_REQUIRED" | "UNAUTHENTICATED";
  message: string;
}>() {
  constructor(code: "FORBIDDEN" | "SECOND_FACTOR_REQUIRED" | "UNAUTHENTICATED") {
    super({ code, message: code });
  }
}

export type CurrentAuthParts = {
  authUserId: Id<"users">;
  sessionId: Id<"authSessions"> | null;
};

const TOKEN_SUB_CLAIM_DIVIDER = "|";

export async function getCurrentAuthParts(
  ctx: QueryCtx | MutationCtx,
): Promise<CurrentAuthParts | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    return null;
  }

  const [authUserId, sessionId] = identity.subject.split(TOKEN_SUB_CLAIM_DIVIDER);

  if (authUserId === undefined) {
    return null;
  }

  return {
    authUserId: authUserId as Id<"users">,
    sessionId: sessionId === undefined ? null : (sessionId as Id<"authSessions">),
  };
}

export async function isSecondFactorVerified(
  ctx: QueryCtx | MutationCtx,
  authUserId: Id<"users">,
  sessionId: Id<"authSessions">,
) {
  const verifiedSession = await ctx.db
    .query("authSecondFactorSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();

  return (
    verifiedSession !== null &&
    verifiedSession.authUserId === authUserId &&
    verifiedSession.expiresAt > Date.now()
  );
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

  const auth = await getCurrentAuthParts(ctx);

  if (
    auth?.sessionId !== null &&
    auth?.sessionId !== undefined &&
    !(await isSecondFactorVerified(ctx, auth.authUserId, auth.sessionId))
  ) {
    return Result.err(new AuthGuardError("SECOND_FACTOR_REQUIRED"));
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
