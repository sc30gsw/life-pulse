import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type SessionErrorCode =
  | "BLOCK_NOT_FOUND"
  | "NO_ACTIVE_SESSION"
  | "NO_PAUSED_SESSION"
  | "SESSION_EXISTS";

export class SessionError extends TaggedError("SessionError")<{
  blockId?: Id<"studyBlocks">;
  code: SessionErrorCode;
  message: string;
  sessionId?: Id<"studySessions">;
}>() {
  constructor(args: {
    blockId?: Id<"studyBlocks">;
    code: SessionErrorCode;
    message?: string;
    sessionId?: Id<"studySessions">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
