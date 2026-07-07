import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { autoAbandon as autoAbandonSession } from "../../services/sessions/autoAbandon";

export const autoAbandon = internalMutation({
  args: { sessionId: v.id("studySessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await autoAbandonSession(ctx, args);

    return null;
  },
});
