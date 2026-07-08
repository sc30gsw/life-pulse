import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export function normalizeCategoryName(name: string) {
  return name.trim();
}

export async function assertCategoryIsActive(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  categoryId: Doc<"studyCategories">["_id"],
) {
  const category = await ctx.db.get(categoryId);

  if (category === null || category.userId !== user._id || category.archivedAt !== undefined) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function assertCategoryBelongsToUser(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  categoryId: Doc<"studyCategories">["_id"],
) {
  const category = await ctx.db.get(categoryId);

  if (category === null || category.userId !== user._id) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function assertCategoryNameAvailable(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  name: Doc<"studyCategories">["name"],
  ignoreCategoryId?: Doc<"studyCategories">["_id"],
) {
  const categories = await ctx.db
    .query("studyCategories")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();

  if (
    categories.some(
      (category) => category._id !== ignoreCategoryId && category.name.trim() === name,
    )
  ) {
    throw new ConvexError("CATEGORY_EXISTS");
  }
}
