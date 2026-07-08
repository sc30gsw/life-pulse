import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { lastSync as lastSyncHealth } from "../../services/health/lastSync";

export const lastSync = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _creationTime: v.number(),
      _id: v.id("syncLogs"),
      at: v.number(),
      message: v.optional(v.string()),
      ok: v.boolean(),
      source: v.string(),
    }),
  ),
  handler: async (ctx) => {
    await requireSelf(ctx);

    return await lastSyncHealth(ctx);
  },
});
