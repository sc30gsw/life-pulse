import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutDocumentValidator, workoutFieldValidators } from "../../lib/validators";
import { workouts as workoutsService } from "../../services/health/workouts";

export const workouts = query({
  args: {
    fromDateJst: workoutFieldValidators.dateJst,
    toDateJst: workoutFieldValidators.dateJst,
  },
  returns: v.array(workoutDocumentValidator),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await workoutsService(ctx, args);
  },
});
