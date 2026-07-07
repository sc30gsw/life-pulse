import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type DeclineArgs = Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function decline(ctx: MutationCtx, user: Doc<"appUsers">, args: DeclineArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "eroded") {
    throw new ConvexError("NOT_ERODED");
  }

  await ctx.db.patch("studyBlocks", block._id, { status: "declined" });
}
