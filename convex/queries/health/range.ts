import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { healthMetricDocumentValidator, healthMetricFieldValidators } from "../../lib/validators";
import { range as rangeService } from "../../services/health/range";

export const range = query({
  args: {
    fromDateJst: healthMetricFieldValidators.dateJst,
    toDateJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.array(healthMetricDocumentValidator),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await rangeService(ctx, args);
  },
});
