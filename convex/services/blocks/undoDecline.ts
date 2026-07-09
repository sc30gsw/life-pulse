import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { BlockError } from "./errors";

type UndoDeclineArgs = Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function undoDecline(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: UndoDeclineArgs,
): Promise<ResultType<void, BlockError>> {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
  }

  if (block.status !== "declined") {
    return Result.err(new BlockError({ blockId: args.blockId, code: "NOT_DECLINED" }));
  }

  await ctx.db.patch("studyBlocks", block._id, { status: "eroded" });

  return Result.ok();
}
