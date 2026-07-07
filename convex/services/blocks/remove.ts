import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type RemoveArgs = Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function remove(ctx: MutationCtx, user: Doc<"appUsers">, args: RemoveArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "planned") {
    throw new ConvexError("NOT_PLANNED");
  }

  await ctx.db.delete("studyBlocks", block._id);
}
