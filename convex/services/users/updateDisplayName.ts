import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { UserError } from "./errors";

export async function updateDisplayName(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  displayName: Doc<"appUsers">["displayName"],
): Promise<ResultType<void, UserError>> {
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return Result.err(new UserError({ code: "INVALID_DISPLAY_NAME" }));
  }

  await ctx.db.patch("appUsers", user._id, { displayName: trimmed });

  return Result.ok();
}
