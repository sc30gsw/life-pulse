import { TaggedError } from "better-result";

type FastingErrorCode = "FASTING_EXISTS" | "FASTING_NOT_ACTIVE" | "INVALID_TARGET";

export class FastingError extends TaggedError("FastingError")<{
  code: FastingErrorCode;
  message: string;
}>() {
  constructor(args: { code: FastingErrorCode; message?: string }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
