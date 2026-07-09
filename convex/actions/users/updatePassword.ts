"use node";

import { v } from "convex/values";

import { action } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { updatePassword as updatePasswordService } from "../../services/users/updatePassword";

// Public action, not a mutation — see convex/actions/users/updateEmail.ts
// for the full rationale (retrieveAccount / modifyAccountCredentials both
// require a GenericActionCtx).
export const updatePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    unwrapConvexResult(await updatePasswordService(ctx, args));

    return null;
  },
});
