import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { StudyCategoryError } from "./errors";
import { assertCategoryNameAvailable, normalizeCategoryName } from "./validate";

type RenameArgs = Pick<Doc<"studyCategories">, "name"> &
  Record<"categoryId", Doc<"studyCategories">["_id"]>;

export async function rename(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: RenameArgs,
): Promise<ResultType<void, StudyCategoryError>> {
  const name = normalizeCategoryName(args.name);

  if (name.length === 0) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "INVALID_NAME" }),
    );
  }

  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
    );
  }

  const availableResult = await assertCategoryNameAvailable(ctx, user, name, args.categoryId);
  if (Result.isError(availableResult)) {
    return availableResult;
  }

  await ctx.db.patch(args.categoryId, { name });

  return Result.ok();
}
