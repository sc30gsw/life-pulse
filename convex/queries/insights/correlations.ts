import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import {
  healthMetricFieldValidators,
  studyBlockFieldValidators,
  workoutFieldValidators,
} from "../../lib/validators";
import { correlations as correlationsService } from "../../services/insights/correlations";

const sampleCountValidator = v.number();
const nullableMetricValidator = v.union(v.number(), v.null());
const correlationSummaryValidator = v.object({
  n: sampleCountValidator,
  r: nullableMetricValidator,
});
const bodyBatteryAverageValidator = v.object({
  avg: nullableMetricValidator,
  n: sampleCountValidator,
});

export const correlations = query({
  args: {
    fromDateJst: healthMetricFieldValidators.dateJst,
    toDateJst: healthMetricFieldValidators.dateJst,
  },
  returns: v.object({
    bbVsStudy: correlationSummaryValidator,
    days: v.array(
      v.object({
        bodyBattery: healthMetricFieldValidators.bodyBattery,
        dateJst: healthMetricFieldValidators.dateJst,
        hiitPrevDay: v.boolean(),
        sleepScore: healthMetricFieldValidators.sleepScore,
        studyMinutes: studyBlockFieldValidators.plannedMinutes,
      }),
    ),
    hiitNextDayBb: v.object({
      withHiit: bodyBatteryAverageValidator,
      withoutHiit: bodyBatteryAverageValidator,
    }),
    sleepVsStudy: correlationSummaryValidator,
    workoutKindBreakdown: v.array(
      v.object({ count: sampleCountValidator, kind: workoutFieldValidators.kind }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await requireSelf(ctx);

    return await correlationsService(ctx, user, args);
  },
});
