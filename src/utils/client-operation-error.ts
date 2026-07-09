import { TaggedError } from "better-result";

export class ClientOperationError extends TaggedError("ClientOperationError")<{
  cause: unknown;
  code: string;
  message: string;
}>() {
  constructor(args: { cause: unknown; code: string; message?: string }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
