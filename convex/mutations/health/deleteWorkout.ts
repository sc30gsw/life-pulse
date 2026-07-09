import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { deleteWorkout as deleteWorkoutHealth } from "../../services/health/deleteWorkout";

export const deleteWorkout = mutation({
  args: { workoutId: v.id("workouts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);
    unwrapConvexResult(await deleteWorkoutHealth(ctx, args));

    return null;
  },
});
