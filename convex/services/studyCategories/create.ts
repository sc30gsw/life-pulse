import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertCategoryNameAvailable, normalizeCategoryName } from "./validate";

type CreateArgs = Pick<Doc<"studyCategories">, "name">;

export async function create(ctx: MutationCtx, user: Doc<"appUsers">, args: CreateArgs) {
  const name = normalizeCategoryName(args.name);

  if (name.length === 0) {
    throw new ConvexError("INVALID_NAME");
  }

  await assertCategoryNameAvailable(ctx, user, name);

  const categories = await ctx.db
    .query("studyCategories")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
  const maxSortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), -1);

  return await ctx.db.insert("studyCategories", {
    archivedAt: undefined,
    name,
    sortOrder: maxSortOrder + 1,
    userId: user._id,
  });
}
