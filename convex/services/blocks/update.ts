import { Result, type Result as ResultType } from "better-result";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst, todayJst } from "../../lib/dateRange";
import { hmToMinutes } from "../../lib/hm";
import type { StudyCategoryError } from "../studyCategories/errors";
import { assertCategoryIsActive } from "../studyCategories/validate";
import { BlockError } from "./errors";

type UpdateArgs = Pick<Doc<"studyBlocks">, "dateJst" | "endHm" | "startHm"> &
  Record<"blockId", Doc<"studyBlocks">["_id"]> &
  Record<"categoryId", Id<"studyCategories">>;

export async function update(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: UpdateArgs,
): Promise<ResultType<void, BlockError | StudyCategoryError>> {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
  }

  if (block.status !== "planned") {
    return Result.err(new BlockError({ blockId: args.blockId, code: "NOT_PLANNED" }));
  }

  assertDateJst(args.dateJst);
  if (args.dateJst < todayJst()) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "PAST_DATE" }));
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "INVALID_RANGE" }));
  }

  const categoryResult = await assertCategoryIsActive(ctx, user, args.categoryId);
  if (Result.isError(categoryResult)) {
    return Result.err(categoryResult.error);
  }

  await ctx.db.patch("studyBlocks", block._id, {
    categoryId: args.categoryId,
    dateJst: args.dateJst,
    endHm: args.endHm,
    plannedMinutes: end - start,
    startHm: args.startHm,
  });

  return Result.ok();
}
