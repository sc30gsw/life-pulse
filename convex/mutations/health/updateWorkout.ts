import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutFieldValidators } from "../../lib/validators";
import { updateWorkout as updateWorkoutHealth } from "../../services/health/updateWorkout";

export const updateWorkout = mutation({
  args: {
    at: workoutFieldValidators.at,
    durationMinutes: workoutFieldValidators.durationMinutes,
    kind: workoutFieldValidators.kind,
    perceivedIntensity: workoutFieldValidators.perceivedIntensity,
    workoutId: v.id("workouts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);
    await updateWorkoutHealth(ctx, args);

    return null;
  },
});
