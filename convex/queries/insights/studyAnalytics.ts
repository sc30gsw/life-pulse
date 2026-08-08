import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { healthMetricFieldValidators } from "../../lib/validators";
import { studyAnalytics as studyAnalyticsService } from "../../services/insights/studyAnalytics";

const erosionReasonsValidator = v.object({
  fatigue: v.number(),
  interruption: v.number(),
  other: v.number(),
  work: v.number(),
});
const interruptionReasonsValidator = v.object({
  chore: v.number(),
  dog: v.number(),
  other: v.number(),
  work: v.number(),
});

export const studyAnalytics = query({
  args: {
    fromDateJst: healthMetricFieldValidators.dateJst,
    toDateJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.object({
    days: v.array(
      v.object({
        dateJst: healthMetricFieldValidators.dateJst,
        defendedMinutes: v.number(),
        defenseRate: v.union(v.number(), v.null()),
        erosionReasons: erosionReasonsValidator,
        interruptionReasons: interruptionReasonsValidator,
        plannedMinutes: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await studyAnalyticsService(ctx, user, args);
  },
});
