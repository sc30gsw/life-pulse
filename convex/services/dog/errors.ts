import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type DogEventErrorCode = "ALREADY_DONE" | "NOT_TODAY" | "TASK_NOT_FOUND";

export class DogEventError extends TaggedError("DogEventError")<{
  code: DogEventErrorCode;
  eventId?: Id<"dogEvents">;
  message: string;
  taskId?: Id<"dogTasks">;
}>() {
  constructor(args: {
    code: DogEventErrorCode;
    eventId?: Id<"dogEvents">;
    message?: string;
    taskId?: Id<"dogTasks">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
