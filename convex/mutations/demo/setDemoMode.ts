import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { setDemoMode as setDemoModeService } from "../../services/demo/setDemoMode";

export const setDemoMode = mutation({
  args: { enabled: v.boolean(), todayJst: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    await setDemoModeService(ctx, args);

    return null;
  },
});
