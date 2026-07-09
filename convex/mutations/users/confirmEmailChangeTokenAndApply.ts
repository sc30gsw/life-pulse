import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { confirmEmailChangeTokenAndApply as confirmEmailChangeTokenAndApplyService } from "../../services/users/emailChange";

export const confirmEmailChangeTokenAndApply = internalMutation({
  args: { authUserId: v.id("users"), now: v.number(), tokenHash: v.string() },
  returns: v.null(),
  handler: async (ctx, args) =>
    unwrapConvexResult(await confirmEmailChangeTokenAndApplyService(ctx, args)),
});
