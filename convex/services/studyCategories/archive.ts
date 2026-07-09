import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { StudyCategoryError } from "./errors";

type ArchiveArgs = Record<"categoryId", Doc<"studyCategories">["_id"]>;

export async function archive(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: ArchiveArgs,
): Promise<ResultType<void, StudyCategoryError>> {
  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
    );
  }

  if (category.archivedAt !== undefined) {
    return Result.ok();
  }

  await ctx.db.patch(args.categoryId, { archivedAt: Date.now() });

  return Result.ok();
}
