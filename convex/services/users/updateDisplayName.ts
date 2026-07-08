import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function updateDisplayName(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  displayName: Doc<"appUsers">["displayName"],
) {
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    throw new ConvexError("INVALID_DISPLAY_NAME");
  }

  await ctx.db.patch("appUsers", user._id, { displayName: trimmed });
}
