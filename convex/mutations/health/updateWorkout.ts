import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutKindValidator } from "../../lib/validators";
import { updateWorkout as updateWorkoutHealth } from "../../services/health/updateWorkout";

export const updateWorkout = mutation({
  args: {
    at: v.number(),
    durationMinutes: v.number(),
    kind: workoutKindValidator,
    perceivedIntensity: v.optional(v.number()),
    workoutId: v.id("workouts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSelf(ctx);
    await updateWorkoutHealth(ctx, args);

    return null;
  },
});
