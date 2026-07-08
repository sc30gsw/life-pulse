import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { presenceFieldValidators } from "../../lib/validators";
import { selfPresence as selfPresenceService } from "../../services/dashboard/selfPresence";

export const selfPresence = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      etaHm: presenceFieldValidators.etaHm,
      state: presenceFieldValidators.state,
      updatedAt: presenceFieldValidators.updatedAt,
    }),
  ),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await selfPresenceService(ctx);
  },
});
