import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type UserErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "EMAIL_CHANGE_TOKEN_EXPIRED"
  | "EMAIL_CHANGE_TOKEN_INVALID"
  | "EMAIL_CHANGE_TOKEN_NOT_OWNED"
  | "INVALID_DISPLAY_NAME"
  | "INVALID_PASSWORD"
  | "STORAGE_DELETE_FAILED"
  | "UNAUTHENTICATED";

export class UserError extends TaggedError("UserError")<{
  cause?: unknown;
  code: UserErrorCode;
  message: string;
  storageId?: Id<"_storage">;
}>() {
  constructor(args: {
    cause?: unknown;
    code: UserErrorCode;
    message?: string;
    storageId?: Id<"_storage">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
