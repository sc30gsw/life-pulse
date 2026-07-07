import type { QueryCtx } from "../../_generated/server";

export async function selfPresence(ctx: QueryCtx) {
  const self = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "self"))
    .first();

  if (self === null) {
    return null;
  }

  const presence = await ctx.db
    .query("presence")
    .withIndex("by_user", (q) => q.eq("userId", self._id))
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
