import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { applyEmailChange as applyEmailChangeService } from "../../services/users/applyEmailChange";

// internalMutation: only called from within the updateEmail action
// (convex/actions/users/updateEmail.ts) via ctx.runMutation, never directly
// from the client (CVX-05 spirit — no unverified caller can reach this).
export const applyEmailChange = internalMutation({
  args: { authUserId: v.id("users"), newEmail: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await applyEmailChangeService(ctx, args);

    return null;
  },
});
