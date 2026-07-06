import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const authSubject = await getAuthUserId(ctx);

  if (authSubject === null) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  const user = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authSubject))
    .unique();

  if (user === null) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  return user;
}

export async function requireSelf(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "self") {
    throw new ConvexError("FORBIDDEN");
  }

  return user;
}
