import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { BlockError } from "./errors";

type ErodeArgs = {
  blockId: Doc<"studyBlocks">["_id"];
  reason: NonNullable<Doc<"studyBlocks">["erosionReason"]>;
};

export async function erode(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: ErodeArgs,
): Promise<ResultType<void, BlockError>> {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
  }

  if (block.status !== "planned") {
    return Result.err(new BlockError({ blockId: args.blockId, code: "NOT_PLANNED" }));
  }

  await ctx.db.patch("studyBlocks", block._id, {
    erosionReason: args.reason,
    status: "eroded",
  });

  return Result.ok();
}
