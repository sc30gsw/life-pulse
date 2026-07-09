import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { end as endFasting } from "../../services/fasting/end";

export const end = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    unwrapConvexResult(await endFasting(ctx, user));

    return null;
  },
});
