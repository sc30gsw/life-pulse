import { ConvexError } from "convex/values";

// Shared by the Password provider's signUp validation (convex/auth.ts) and the
// profile password-change mutation (convex/services/users/updatePassword.ts)
// so the two paths can never drift apart.
export function validatePasswordRequirements(password: string): void {
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new ConvexError("パスワードは12文字以上、英大文字・小文字・数字を含めてください");
  }
}
