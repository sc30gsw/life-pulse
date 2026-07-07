import type { QueryCtx } from "../../_generated/server";

export async function presence(ctx: QueryCtx) {
  const partner = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "partner"))
    .first();

  if (partner === null) {
    return null;
  }

  const presence = await ctx.db
    .query("presence")
    .withIndex("by_user", (q) => q.eq("userId", partner._id))
    .first();

  if (presence === null) {
    return null;
  }

  return {
    etaHm: presence.etaHm,
    state: presence.state,
    updatedAt: presence.updatedAt,
  };
}
