import { v } from "convex/values";

import { internalQuery } from "../../_generated/server";

export const getAuthUserEmail = internalQuery({
  args: { authUserId: v.id("users") },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.authUserId);

    return user?.email ?? null;
  },
});
