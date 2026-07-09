import { TaggedError } from "better-result";

import type { AUTH_FLOW_ERROR_CODE_VALUES } from "../../lib/domain";

export type AuthFlowErrorCode = (typeof AUTH_FLOW_ERROR_CODE_VALUES)[number];

export class AuthFlowError extends TaggedError("AuthFlowError")<{
  cause?: unknown;
  code: AuthFlowErrorCode;
  message: string;
}>() {
  constructor(args: { cause?: unknown; code: AuthFlowErrorCode; message?: string }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
