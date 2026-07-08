import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

// requireUser-equivalent for an action-context caller (retrieveAccount /
// modifyAccountCredentials from @convex-dev/auth/server require a
// GenericActionCtx, so the caller's own updateEmail/updatePassword actions
// cannot call requireUser directly — it needs ctx.db, which actions don't
// have). Confirms the authSubject has a registered appUsers row (same
// UNAUTHENTICATED guard as requireUser), then resolves the current login
// email from the framework `users` table.
export async function getEmailForCaller(ctx: QueryCtx, authUserId: Id<"users">) {
  const appUser = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authUserId))
    .unique();

  if (appUser === null) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  const authUser = await ctx.db.get("users", authUserId);

  if (authUser?.email === undefined) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  return authUser.email;
}
