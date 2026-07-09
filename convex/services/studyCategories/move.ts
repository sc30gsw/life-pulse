import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { StudyCategoryError } from "./errors";
import { listActiveStudyCategories } from "./list";

type MoveDirection = "down" | "up";
type MoveArgs = {
  categoryId: Doc<"studyCategories">["_id"];
  direction?: MoveDirection;
  targetCategoryId?: Doc<"studyCategories">["_id"];
};

export async function move(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: MoveArgs,
): Promise<ResultType<void, StudyCategoryError>> {
  const activeCategories = await listActiveStudyCategories(ctx, user);
  const index = activeCategories.findIndex((category) => category._id === args.categoryId);

  if (index === -1) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
    );
  }

  if (args.targetCategoryId !== undefined) {
    const targetIndex = activeCategories.findIndex(
      (category) => category._id === args.targetCategoryId,
    );

    if (targetIndex === -1) {
      return Result.err(
        new StudyCategoryError({
          categoryId: args.categoryId,
          code: "CATEGORY_NOT_FOUND",
          targetCategoryId: args.targetCategoryId,
        }),
      );
    }

    if (targetIndex === index) {
      return Result.ok();
    }

    const [current] = activeCategories.splice(index, 1);

    if (current === undefined) {
      return Result.err(
        new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
      );
    }

    const adjustedTargetIndex = activeCategories.findIndex(
      (category) => category._id === args.targetCategoryId,
    );
    activeCategories.splice(
      index < targetIndex ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      current,
    );

    await Promise.all(
      activeCategories.map((category, sortOrder) =>
        ctx.db.patch("studyCategories", category._id, { sortOrder }),
      ),
    );
    return Result.ok();
  }

  if (args.direction === undefined) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "MOVE_TARGET_REQUIRED" }),
    );
  }

  const swapIndex = args.direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= activeCategories.length) {
    return Result.ok();
  }

  const current = activeCategories[index];
  const swapWith = activeCategories[swapIndex];

  if (current === undefined || swapWith === undefined) {
    return Result.err(
      new StudyCategoryError({ categoryId: args.categoryId, code: "CATEGORY_NOT_FOUND" }),
    );
  }

  await ctx.db.patch("studyCategories", current._id, { sortOrder: swapWith.sortOrder });
  await ctx.db.patch("studyCategories", swapWith._id, { sortOrder: current.sortOrder });

  return Result.ok();
}
