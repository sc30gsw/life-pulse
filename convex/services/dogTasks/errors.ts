import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type DogTaskErrorCode = "INVALID_NAME" | "MOVE_TARGET_REQUIRED" | "TASK_NOT_FOUND";

export class DogTaskError extends TaggedError("DogTaskError")<{
  code: DogTaskErrorCode;
  message: string;
  taskId?: Id<"dogTasks">;
  targetTaskId?: Id<"dogTasks">;
}>() {
  constructor(args: {
    code: DogTaskErrorCode;
    message?: string;
    taskId?: Id<"dogTasks">;
    targetTaskId?: Id<"dogTasks">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
