import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertCategoryNameAvailable, normalizeCategoryName } from "./validate";

type RenameArgs = Pick<Doc<"studyCategories">, "name"> &
  Record<"categoryId", Doc<"studyCategories">["_id"]>;

export async function rename(ctx: MutationCtx, user: Doc<"appUsers">, args: RenameArgs) {
  const name = normalizeCategoryName(args.name);

  if (name.length === 0) {
    throw new ConvexError("INVALID_NAME");
  }

  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    throw new ConvexError("CATEGORY_NOT_FOUND");
  }

  await assertCategoryNameAvailable(ctx, user, name, args.categoryId);
  await ctx.db.patch(args.categoryId, { name });
}
