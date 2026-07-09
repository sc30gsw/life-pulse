import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { syncLogDocumentValidator } from "../../lib/validators";
import { lastSync as lastSyncHealth } from "../../services/health/lastSync";

export const lastSync = query({
  args: {},
  returns: v.union(v.null(), syncLogDocumentValidator),
  handler: async (ctx) => {
    await requireSelf(ctx);

    return await lastSyncHealth(ctx);
  },
});
