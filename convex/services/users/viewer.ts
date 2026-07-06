import type { QueryCtx } from "../../_generated/server";

export async function viewer(ctx: QueryCtx, authSubject: string) {
  return await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authSubject))
    .unique();
}
