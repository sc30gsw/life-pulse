import { Result, type Result as ResultType } from "better-result";

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { UserError } from "./errors";

// requireUser-equivalent for an action-context caller (retrieveAccount /
// modifyAccountCredentials from @convex-dev/auth/server require a
// GenericActionCtx, so the caller's own updateEmail/updatePassword actions
// cannot call requireUser directly — it needs ctx.db, which actions don't
// have). Confirms the authSubject has a registered appUsers row (same
// UNAUTHENTICATED guard as requireUser), then resolves the current login
// email from the framework `users` table.
export async function getEmailForCaller(
  ctx: QueryCtx,
  authUserId: Id<"users">,
): Promise<ResultType<string, UserError>> {
  const appUser = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authUserId))
    .unique();

  if (appUser === null) {
    return Result.err(new UserError({ code: "UNAUTHENTICATED" }));
  }

  const authUser = await ctx.db.get("users", authUserId);

  if (authUser?.email === undefined) {
    return Result.err(new UserError({ code: "UNAUTHENTICATED" }));
  }

  return Result.ok(authUser.email);
}
