import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { end as endFasting } from "../../services/fasting/end";

export const end = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    await endFasting(ctx, user);

    return null;
  },
});
