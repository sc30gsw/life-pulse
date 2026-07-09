import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { interruptionReasonValidator } from "../../lib/validators";
import { pause as pauseSession } from "../../services/sessions/pause";

export const pause = mutation({
  args: { reason: interruptionReasonValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    unwrapConvexResult(await pauseSession(ctx, user, args));

    return null;
  },
});
