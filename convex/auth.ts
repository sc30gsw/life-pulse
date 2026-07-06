import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { WithoutSystemFields } from "convex/server";
import { ConvexError } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { ensureUser } from "./services/users/ensureUser";

// Sign-up profile: `email` lives on the auth `users` table, while
// `displayName` / `role` belong to `appUsers` only (SSoT — never written to `users`).
type SignUpProfile = Pick<WithoutSystemFields<Doc<"users">>, "email"> &
  Pick<WithoutSystemFields<Doc<"appUsers">>, "displayName" | "role">;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  callbacks: {
    // NOTE: afterUserCreatedOrUpdated is never called once createOrUpdateUser is
    // specified, so the appUsers write must happen here (same transaction, CVX-15).
    async createOrUpdateUser(ctx, args) {
      const { displayName, email, role } = args.profile as SignUpProfile;
      const userId = args.existingUserId ?? (await ctx.db.insert("users", { email }));
      await ensureUser(ctx, userId, { displayName, role });

      return userId;
    },
  },
  providers: [
    Password({
      profile(params) {
        return {
          displayName: params.displayName as SignUpProfile["displayName"],
          email: params.email as NonNullable<SignUpProfile["email"]>,
          role: params.role as SignUpProfile["role"],
        };
      },
      validatePasswordRequirements: (password: string) => {
        if (
          password.length < 12 ||
          !/[a-z]/.test(password) ||
          !/[A-Z]/.test(password) ||
          !/\d/.test(password)
        ) {
          throw new ConvexError("パスワードは12文字以上、英大文字・小文字・数字を含めてください");
        }
      },
    }),
  ],
});
