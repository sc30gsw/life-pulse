import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { presenceStateValidator } from "../../lib/validators";
import { presence as presenceService } from "../../services/dashboard/presence";

export const presence = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      etaHm: v.optional(v.string()),
      state: presenceStateValidator,
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await presenceService(ctx);
  },
});
