import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function resolveCurrentSession(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"appUsers">,
): Promise<Doc<"studySessions"> | null> {
  const active = await ctx.db
    .query("studySessions")
    .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "active"))
    .first();

  if (active !== null) {
    return active;
  }

  return await ctx.db
    .query("studySessions")
    .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "paused"))
    .first();
}
