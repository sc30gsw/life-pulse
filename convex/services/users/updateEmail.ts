import { getAuthUserId, retrieveAccount } from "@convex-dev/auth/server";
import { Result, type Result as ResultType } from "better-result";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import { UserError } from "./errors";

type UpdateEmailArgs = {
  currentPassword: NonNullable<Doc<"authAccounts">["secret"]>;
  newEmail: NonNullable<Doc<"users">["email"]>;
};

// NOTE on placement (see convex/actions/users/updateEmail.ts for the full
// rationale): retrieveAccount below requires a GenericActionCtx — it is not
// callable from a mutation — so this whole flow is an action, not a
// mutation, even though it only exists to gate a DB write.
export async function updateEmail(
  ctx: ActionCtx,
  args: UpdateEmailArgs,
): Promise<ResultType<void, UserError>> {
  const authUserId = await getAuthUserId(ctx);

  if (authUserId === null) {
    return Result.err(new UserError({ code: "UNAUTHENTICATED" }));
  }

  // requireUser-equivalent (CVX-04) + resolve the caller's OWN current email
  // — never trust an email/userId argument from the client (there is none
  // here; identity is derived from ctx.auth only).
  const currentEmail = await ctx.runQuery(
    internal.queries.users.getEmailForCaller.getEmailForCaller,
    {
      authUserId,
    },
  );

  const accountResult = await Result.tryPromise({
    catch: (cause) => new UserError({ cause, code: "INVALID_PASSWORD" }),
    try: () =>
      retrieveAccount(ctx, {
        provider: "password",
        account: { id: currentEmail, secret: args.currentPassword },
      }),
  });

  if (Result.isError(accountResult)) {
    return Result.err(accountResult.error);
  }

  await ctx.runMutation(internal.mutations.users.applyEmailChange.applyEmailChange, {
    authUserId,
    newEmail: args.newEmail,
  });

  return Result.ok();
}
