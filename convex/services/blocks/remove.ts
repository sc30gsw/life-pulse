import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { BlockError } from "./errors";

type RemoveArgs = Record<"blockId", Doc<"studyBlocks">["_id"]>;

export async function remove(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  args: RemoveArgs,
): Promise<ResultType<void, BlockError>> {
  const block = await ctx.db.get("studyBlocks", args.blockId);

  if (block === null || block.userId !== user._id) {
    return Result.err(new BlockError({ blockId: args.blockId, code: "BLOCK_NOT_FOUND" }));
  }

  if (block.status !== "planned") {
    return Result.err(new BlockError({ blockId: args.blockId, code: "NOT_PLANNED" }));
  }

  await ctx.db.delete("studyBlocks", block._id);

  return Result.ok();
}
