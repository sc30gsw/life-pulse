import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { hmToMinutes } from "../../lib/hm";

type RescheduleArgs = Pick<Doc<"studyBlocks">, "endHm" | "startHm"> &
  Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function reschedule(ctx: MutationCtx, user: Doc<"appUsers">, args: RescheduleArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "eroded") {
    throw new ConvexError("NOT_ERODED");
  }

  const start = hmToMinutes(args.startHm);
  const end = hmToMinutes(args.endHm);

  if (start === null || end === null || start >= end) {
    throw new ConvexError("INVALID_RANGE");
  }

  // spec §4.3: the replacement is a fresh planned block (source stays "manual");
  // the original keeps the erosion record and points at its successor.
  const newBlockId = await ctx.db.insert("studyBlocks", {
    category: block.category,
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

  return newBlockId;
}
