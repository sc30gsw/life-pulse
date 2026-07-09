import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { fastingWindowDocumentValidator } from "../../lib/validators";
import { fasting as fastingService } from "../../services/dashboard/fasting";

export const fasting = query({
  args: {},
  returns: v.union(v.null(), fastingWindowDocumentValidator),
  handler: async (ctx) => {
    await requireUser(ctx);

    return await fastingService(ctx);
  },
});
