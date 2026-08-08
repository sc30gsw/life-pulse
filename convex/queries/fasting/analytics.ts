import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  creationTimeValidator,
  endedFastingStatusValidator,
  fastingWindowFieldValidators,
  healthMetricFieldValidators,
} from "../../lib/validators";
import { analytics as analyticsService } from "../../services/fasting/analytics";

const endedFastingWindowValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("fastingWindows"),
  ...fastingWindowFieldValidators,
  status: endedFastingStatusValidator,
});

export const analytics = query({
  args: {
    fromDateJst: healthMetricFieldValidators.dateJst,
    toDateJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.array(endedFastingWindowValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const windows = await analyticsService(ctx, user, args);

    return windows.map((window) => ({ ...window, status: "ended" as const }));
  },
});
