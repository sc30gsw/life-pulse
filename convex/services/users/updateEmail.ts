import { getAuthUserId, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

type UpdateEmailArgs = { currentPassword: string; newEmail: string };

// NOTE on placement (see convex/actions/users/updateEmail.ts for the full
// rationale): retrieveAccount below requires a GenericActionCtx — it is not
// callable from a mutation — so this whole flow is an action, not a
// mutation, even though it only exists to gate a DB write.
export async function updateEmail(ctx: ActionCtx, args: UpdateEmailArgs) {
  const authUserId = await getAuthUserId(ctx);

  if (authUserId === null) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  // requireUser-equivalent (CVX-04) + resolve the caller's OWN current email
  // — never trust an email/userId argument from the client (there is none
  // here; identity is derived from ctx.auth only).
  const currentEmail = await ctx.runQuery(internal.queries.users.getEmailForCaller.getEmailForCaller, {
    authUserId,
  });

  try {
    await retrieveAccount(ctx, {
      provider: "password",
      account: { id: currentEmail, secret: args.currentPassword },
    });
  } catch {
    throw new ConvexError("INVALID_PASSWORD");
  }

  await ctx.runMutation(internal.mutations.users.applyEmailChange.applyEmailChange, {
    authUserId,
    newEmail: args.newEmail,
  });
}
