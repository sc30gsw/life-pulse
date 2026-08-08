import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { healthMetricDocumentValidator, healthMetricFieldValidators } from "../../lib/validators";
import { analytics as analyticsService } from "../../services/health/analytics";

export const analytics = query({
  args: {
    fromDateJst: healthMetricFieldValidators.dateJst,
    toDateJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.array(healthMetricDocumentValidator),
  handler: async (ctx, args) => {
    await requireSelf(ctx);
    return await analyticsService(ctx, args);
  },
});
