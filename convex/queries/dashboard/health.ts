import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { healthMetricDocumentValidator, healthMetricFieldValidators } from "../../lib/validators";
import { health as healthService } from "../../services/dashboard/health";

export const health = query({
  args: { dateJst: healthMetricFieldValidators.dateJst },
  returns: v.union(v.null(), healthMetricDocumentValidator),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    return await healthService(ctx, args);
  },
});
