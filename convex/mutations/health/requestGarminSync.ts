import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { requestGarminSync as requestGarminSyncHealth } from "../../services/health/requestGarminSync";

export const requestGarminSync = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireSelf(ctx);

    await requestGarminSyncHealth(ctx);

    return null;
  },
});
