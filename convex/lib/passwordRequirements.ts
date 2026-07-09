import { Result, TaggedError, type Result as ResultType } from "better-result";

import { unwrapConvexResult } from "./result";

// Shared by the Password provider's signUp validation (convex/auth.ts) and the
// profile password-change mutation (convex/services/users/updatePassword.ts)
// so the two paths can never drift apart.
const PASSWORD_REQUIREMENTS_MESSAGE =
  "パスワードは12文字以上、英大文字・小文字・数字を含めてください";

class PasswordRequirementsError extends TaggedError("PasswordRequirementsError")<{
  code: typeof PASSWORD_REQUIREMENTS_MESSAGE;
  message: string;
}>() {
  constructor() {
    super({ code: PASSWORD_REQUIREMENTS_MESSAGE, message: PASSWORD_REQUIREMENTS_MESSAGE });
  }
}

export function checkPasswordRequirements(
  password: string,
): ResultType<void, PasswordRequirementsError> {
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return Result.err(new PasswordRequirementsError());
  }

  return Result.ok();
}

export function validatePasswordRequirements(password: string): void {
  return unwrapConvexResult(checkPasswordRequirements(password));
}
