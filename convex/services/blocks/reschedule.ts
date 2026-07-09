import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { hmToMinutes } from "../../lib/hm";
import { BlockError } from "./errors";

type RescheduleArgs = Pick<Doc<"studyBlocks">, "endHm" | "startHm"> &
  Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function reschedule(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: RescheduleArgs,
): Promise<ResultType<Doc<"studyBlocks">["_id"], BlockError>> {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
  }

  if (block.status !== "eroded") {
    return Result.err(new BlockError({ blockId: args.blockId, code: "NOT_ERODED" }));
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "INVALID_RANGE" }));
  }

  // spec §4.3: the replacement is a fresh planned block (source stays "manual");
  // the original keeps the erosion record and points at its successor.
  if (block.categoryId === undefined) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "CATEGORY_NOT_FOUND" }));
  }

  const newBlockId = await ctx.db.insert("studyBlocks", {
    categoryId: block.categoryId,
    dateJst: block.dateJst,
    endHm: args.endHm,
    plannedMinutes: end - start,
    source: "manual",
    startHm: args.startHm,
    status: "planned",
    userId: user._id,
  });

  await ctx.db.patch("studyBlocks", block._id, {
    rescheduledToId: newBlockId,
    status: "rescheduled",
  });

  return Result.ok(newBlockId);
}
