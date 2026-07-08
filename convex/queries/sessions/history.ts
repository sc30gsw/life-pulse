import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import {
  interruptionReasonValidator,
  studyBlockFieldValidators,
  studySessionFieldValidators,
} from "../../lib/validators";
import { history as historyService } from "../../services/sessions/history";

const actualMinutesValidator = studyBlockFieldValidators.plannedMinutes;

export const history = query({
  args: {
    fromDateJst: studySessionFieldValidators.dateJst,
    toDateJst: studySessionFieldValidators.dateJst,
  },
  returns: v.object({
    days: v.array(
      v.object({
        dateJst: studySessionFieldValidators.dateJst,
        sessions: v.array(
          v.object({
            actualMinutes: actualMinutesValidator,
            categoryId: studySessionFieldValidators.categoryId,
            id: v.id("studySessions"),
            interruptionCount: studySessionFieldValidators.interruptionCount,
            reasons: v.array(interruptionReasonValidator),
            startedAt: studySessionFieldValidators.startedAt,
            status: studySessionFieldValidators.status,
          }),
        ),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await historyService(ctx, user, args);
  },
});
