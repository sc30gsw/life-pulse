import { v } from "convex/values";

import { internalQuery } from "../../_generated/server";

export const getAuthUserByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.null(), v.object({ authUserId: v.id("users"), email: v.string() })),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (user?.email === undefined) {
      return null;
    }

    return { authUserId: user._id, email: user.email };
  },
});
