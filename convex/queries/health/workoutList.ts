import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutDocumentValidator, workoutFieldValidators } from "../../lib/validators";
import { workoutList as workoutListService } from "../../services/health/workoutList";

export const workoutList = query({
  args: {
    fromDateJst: workoutFieldValidators.dateJst,
    toDateJst: workoutFieldValidators.dateJst,
  },
  returns: v.object({
    hasMore: v.boolean(),
    hiddenWorkouts: v.array(workoutDocumentValidator),
    visibleWorkouts: v.array(workoutDocumentValidator),
  }),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await workoutListService(ctx, args);
  },
});
