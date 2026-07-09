import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { StudyCategoryError } from "./errors";

export function normalizeCategoryName(name: string) {
  return name.trim();
}

export async function assertCategoryIsActive(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  categoryId: Doc<"studyCategories">["_id"],
): Promise<ResultType<Doc<"studyCategories">, StudyCategoryError>> {
  const category = await ctx.db.get(categoryId);

  if (category === null || category.userId !== user._id || category.archivedAt !== undefined) {
    return Result.err(new StudyCategoryError({ categoryId, code: "CATEGORY_NOT_FOUND" }));
  }

  return Result.ok(category);
}

export async function assertCategoryBelongsToUser(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  categoryId: Doc<"studyCategories">["_id"],
): Promise<ResultType<Doc<"studyCategories">, StudyCategoryError>> {
  const category = await ctx.db.get(categoryId);

  if (category === null || category.userId !== user._id) {
    return Result.err(new StudyCategoryError({ categoryId, code: "CATEGORY_NOT_FOUND" }));
  }

  return Result.ok(category);
}

export async function assertCategoryNameAvailable(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"appUsers">,
  name: Doc<"studyCategories">["name"],
  ignoreCategoryId?: Doc<"studyCategories">["_id"],
): Promise<ResultType<void, StudyCategoryError>> {
  const categories = await ctx.db
    .query("studyCategories")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();

  if (
    categories.some(
      (category) => category._id !== ignoreCategoryId && category.name.trim() === name,
    )
  ) {
    return Result.err(
      new StudyCategoryError({ categoryId: ignoreCategoryId, code: "CATEGORY_EXISTS" }),
    );
  }

  return Result.ok();
}
