import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type DogErrorCode = "DOG_NOT_FOUND" | "INVALID_NAME" | "STORAGE_DELETE_FAILED";

export class DogError extends TaggedError("DogError")<{
  cause?: unknown;
  code: DogErrorCode;
  message: string;
  storageId?: Id<"_storage">;
}>() {
  constructor(args: {
    cause?: unknown;
    code: DogErrorCode;
    message?: string;
    storageId?: Id<"_storage">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
