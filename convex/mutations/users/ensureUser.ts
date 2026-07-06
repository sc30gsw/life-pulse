import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { mutation } from "../../_generated/server";
import { roleValidator } from "../../lib/validators";
import { ensureUser as ensureUserService } from "../../services/users/ensureUser";

export const ensureUser = mutation({
  args: {
    displayName: v.string(),
    role: roleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authSubject = await getAuthUserId(ctx);
    if (authSubject === null) {
      throw new ConvexError("UNAUTHENTICATED");
    }

    await ensureUserService(ctx, authSubject, args);
    return null;
  },
});
