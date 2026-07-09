import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type BlockErrorCode =
  | "BLOCK_NOT_FOUND"
  | "CATEGORY_NOT_FOUND"
  | "INVALID_RANGE"
  | "NOT_DECLINED"
  | "NOT_ERODED"
  | "NOT_PLANNED"
  | "PAST_DATE";

export class BlockError extends TaggedError("BlockError")<{
  blockId?: Id<"studyBlocks">;
  code: BlockErrorCode;
  message: string;
}>() {
  constructor(args: { blockId?: Id<"studyBlocks">; code: BlockErrorCode; message?: string }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
