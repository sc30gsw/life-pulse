import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type UndoDeclineArgs = Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function undoDecline(ctx: MutationCtx, user: Doc<"appUsers">, args: UndoDeclineArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "declined") {
    throw new ConvexError("NOT_DECLINED");
  }

  await ctx.db.patch("studyBlocks", block._id, { status: "eroded" });
}
