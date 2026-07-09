import { TaggedError } from "better-result";

type SettingsErrorCode = "INVALID_TARGET";

export class SettingsError extends TaggedError("SettingsError")<{
  code: SettingsErrorCode;
  message: string;
}>() {
  constructor(args: { code: SettingsErrorCode; message?: string }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
