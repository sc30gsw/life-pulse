import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { createEmailChangeToken as createEmailChangeTokenService } from "../../services/users/emailChange";

export const createEmailChangeToken = internalMutation({
  args: {
    authUserId: v.id("users"),
    newEmail: v.string(),
    now: v.number(),
    tokenHash: v.string(),
  },
  returns: v.id("emailChangeTokens"),
  handler: async (ctx, args) => unwrapConvexResult(await createEmailChangeTokenService(ctx, args)),
});
