import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { StudyCategoryError } from "./errors";
import { assertCategoryNameAvailable, normalizeCategoryName } from "./validate";

type CreateArgs = Pick<Doc<"studyCategories">, "name">;

export async function create(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: CreateArgs,
): Promise<ResultType<Doc<"studyCategories">["_id"], StudyCategoryError>> {
  const name = normalizeCategoryName(args.name);

  if (name.length === 0) {
    return Result.err(new StudyCategoryError({ code: "INVALID_NAME" }));
  }

  const availableResult = await assertCategoryNameAvailable(ctx, user, name);
  if (Result.isError(availableResult)) {
    return availableResult;
  }

  const categories = await ctx.db
    .query("studyCategories")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
  const maxSortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), -1);

  return Result.ok(
    await ctx.db.insert("studyCategories", {
      archivedAt: undefined,
      name,
      sortOrder: maxSortOrder + 1,
      userId: user._id,
    }),
  );
}
