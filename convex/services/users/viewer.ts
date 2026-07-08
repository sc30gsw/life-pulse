import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

export async function viewer(ctx: QueryCtx, authSubject: Doc<"appUsers">["authSubject"]) {
  const user = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authSubject))
    .unique();

  if (user === null) {
    return null;
  }

  const avatarUrl =
    user.avatarStorageId !== undefined ? await ctx.storage.getUrl(user.avatarStorageId) : null;

  return { ...user, avatarUrl };
}
