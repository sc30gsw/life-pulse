import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { presenceStateValidator } from "../../lib/validators";
import { setStatus as setStatusService } from "../../services/partnerStatus/setStatus";

export const setStatus = mutation({
  args: {
    state: presenceStateValidator,
    etaHm: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await setStatusService(ctx, user, args);

    return null;
  },
});
