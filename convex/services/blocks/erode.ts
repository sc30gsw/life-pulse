import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type ErodeArgs = {
  blockId: Doc<"studyBlocks">["_id"];
  reason: NonNullable<Doc<"studyBlocks">["erosionReason"]>;
};

export async function erode(ctx: MutationCtx, user: Doc<"appUsers">, args: ErodeArgs) {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    throw new ConvexError("BLOCK_NOT_FOUND");
  }

  if (block.status !== "planned") {
    throw new ConvexError("NOT_PLANNED");
  }

  await ctx.db.patch("studyBlocks", block._id, {
    erosionReason: args.reason,
    status: "eroded",
  });
}
