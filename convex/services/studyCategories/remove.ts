import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { archive } from "./archive";
import { StudyCategoryError } from "./errors";

type RemoveArgs = Record<"categoryId", Doc<"studyCategories">["_id"]>;

async function hasCategoryUsage(ctx: MutationCtx, categoryId: Doc<"studyCategories">["_id"]) {
  const [block, session] = await Promise.all([
    ctx.db
      .query("studyBlocks")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .first(),
    ctx.db
      .query("studySessions")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .first(),
  ]);

  return block !== null || session !== null;
}

export async function remove(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: RemoveArgs,
): Promise<ResultType<"archived" | "deleted", StudyCategoryError>> {
  const category = await ctx.db.get(args.categoryId);

  if (category === null || category.userId !== user._id) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
    );
  }

  if (await hasCategoryUsage(ctx, args.categoryId)) {
    const archiveResult = await archive(ctx, user, args);
    if (Result.isError(archiveResult)) {
      return Result.err(archiveResult.error);
    }

    return Result.ok("archived");
  }

  await ctx.db.delete(args.categoryId);
  return Result.ok("deleted");
}
