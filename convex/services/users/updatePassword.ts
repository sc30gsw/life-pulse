import { getAuthUserId, modifyAccountCredentials, retrieveAccount } from "@convex-dev/auth/server";
import { Result, type Result as ResultType } from "better-result";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import { validatePasswordRequirements } from "../../lib/passwordRequirements";
import { UserError } from "./errors";

type UpdatePasswordArgs = Record<
  "currentPassword" | "newPassword",
  NonNullable<Doc<"authAccounts">["secret"]>
>;

// See convex/actions/users/updatePassword.ts for why this is an action, not
// a mutation (retrieveAccount / modifyAccountCredentials require a
// GenericActionCtx).
export async function updatePassword(
  ctx: ActionCtx,
  args: UpdatePasswordArgs,
): Promise<ResultType<void, UserError>> {
  const authUserId = await getAuthUserId(ctx);

  if (authUserId === null) {
    return Result.err(new UserError({ code: "UNAUTHENTICATED" }));
  }

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

  // Same requirement as sign-up (convex/auth.ts) — reuse the one shared
  // validator so the two paths can never drift apart.
  validatePasswordRequirements(args.newPassword);

  // modifyAccountCredentials safely rehashes and stores the new secret using
  // the library's own crypto config — never reimplemented here.
  await modifyAccountCredentials(ctx, {
    provider: "password",
    account: { id: currentEmail, secret: args.newPassword },
  });

  return Result.ok();
}
