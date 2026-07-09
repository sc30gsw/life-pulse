import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { presenceFieldValidators } from "../../lib/validators";
import { presence as presenceService } from "../../services/dashboard/presence";

export const presence = query({
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

    return await presenceService(ctx);
  },
});
