import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { unwrapConvexResult } from "../../lib/result";
import { workoutFieldValidators } from "../../lib/validators";
import { logWorkout as logWorkoutHealth } from "../../services/health/logWorkout";

export const logWorkout = mutation({
  args: {
    at: workoutFieldValidators.at,
    durationMinutes: workoutFieldValidators.durationMinutes,
    kind: workoutFieldValidators.kind,
    perceivedIntensity: workoutFieldValidators.perceivedIntensity,
  },
  returns: v.id("workouts"),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return unwrapConvexResult(await logWorkoutHealth(ctx, args));
  },
});
