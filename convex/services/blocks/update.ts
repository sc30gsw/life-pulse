import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertDateJst, todayJst } from "../../lib/dateRange";
import { hmToMinutes } from "../../lib/hm";
import { assertCategoryIsActive } from "../studyCategories/validate";

type UpdateArgs = Pick<Doc<"studyBlocks">, "dateJst" | "endHm" | "startHm"> &
  Record<"blockId", Doc<"studyBlocks">["_id"]> &
  Record<"categoryId", Id<"studyCategories">>;

export async function update(ctx: MutationCtx, user: Doc<"appUsers">, args: UpdateArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "planned") {
    throw new ConvexError("NOT_PLANNED");
  }

  assertDateJst(args.dateJst);
  if (args.dateJst < todayJst()) {
    throw new ConvexError("PAST_DATE");
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    throw new ConvexError("INVALID_RANGE");
  }

  await assertCategoryIsActive(ctx, user, args.categoryId);

  await ctx.db.patch("studyBlocks", block._id, {
    categoryId: args.categoryId,
    dateJst: args.dateJst,
    endHm: args.endHm,
    plannedMinutes: end - start,
    startHm: args.startHm,
  });
}
