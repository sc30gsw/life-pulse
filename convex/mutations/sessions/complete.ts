import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { complete as completeSession } from "../../services/sessions/complete";

export const complete = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await completeSession(ctx, user));

    return null;
  },
});
