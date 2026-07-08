import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type ApplyEmailChangeArgs = { authUserId: Id<"users">; newEmail: Doc<"users">["email"] };

// Updates the two places email lives — the framework `users.email` field
// (display/lookup, per convex/auth.ts's SSoT comment) AND the Password
// provider's identifying `authAccounts.providerAccountId` (its login
// account "id" IS the email, see node_modules/@convex-dev/auth Password.js:
// `account: { id: email, secret }`) — in the SAME mutation transaction
// (CVX-15), so a user can never end up with a dashboard showing the new
// email but still logging in with the old one, or vice versa.
//
// This only touches the identifying field, never `authAccounts.secret` (the
// hashed password) — rotating that goes exclusively through the library's
// own modifyAccountCredentials (see services/users/updatePassword.ts).
export async function applyEmailChange(ctx: MutationCtx, args: ApplyEmailChangeArgs) {
  const account = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) =>
      q.eq("userId", args.authUserId).eq("provider", "password"),
    )
    .unique();

  if (account === null) {
    throw new ConvexError("ACCOUNT_NOT_FOUND");
  }

  await ctx.db.patch("users", args.authUserId, { email: args.newEmail });
  await ctx.db.patch("authAccounts", account._id, { providerAccountId: args.newEmail });
}
