import { v } from "convex/values";

import { internalQuery } from "../../_generated/server";
import { getEmailForCaller as getEmailForCallerService } from "../../services/users/getEmailForCaller";

// internalQuery: only called from within updateEmail/updatePassword
// (convex/actions/users/) via ctx.runQuery, never directly from the client.
export const getEmailForCaller = internalQuery({
  args: { authUserId: v.id("users") },
  returns: v.string(),
  handler: async (ctx, args) => {
    return await getEmailForCallerService(ctx, args.authUserId);
  },
});
