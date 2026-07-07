import type { QueryCtx } from "../../_generated/server";

export async function history(ctx: QueryCtx) {
  const selfUser = await ctx.db
    .query("appUsers")
    .withIndex("by_role", (q) => q.eq("role", "self"))
    .first();

  if (selfUser === null) {
    return [];
  }

  const windows = await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", selfUser._id).eq("status", "ended"))
    .order("desc")
    .take(30);

  return windows.map((window) => ({ ...window, status: "ended" as const }));
}
