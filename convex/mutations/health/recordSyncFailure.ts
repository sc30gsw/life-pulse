import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { syncLogFieldValidators } from "../../lib/validators";
import { recordSyncFailure as recordSyncFailureHealth } from "../../services/health/recordSyncFailure";

// internalMutation (CVX-01/05): written to only by
// convex/actions/garmin/syncDaily.ts ("use node" internalAction, plan Step 6)
// — never exposed to the client.
export const recordSyncFailure = internalMutation({
  args: { message: syncLogFieldValidators.message },
  returns: v.null(),
  handler: async (ctx, args) => {
    await recordSyncFailureHealth(ctx, args);

    return null;
  },
});
