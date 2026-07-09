import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function listStudyCategories(ctx: QueryCtx | MutationCtx, user: Doc<"appUsers">) {
  const categories = await ctx.db
    .query("studyCategories")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();

  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listActiveStudyCategories(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
) {
  const categories = await listStudyCategories(ctx, user);

  return categories.filter((category) => category.archivedAt === undefined);
}
