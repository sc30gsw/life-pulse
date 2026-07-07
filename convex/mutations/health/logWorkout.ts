import { v } from "convex/values";

import { mutation } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutKindValidator } from "../../lib/validators";
import { logWorkout as logWorkoutHealth } from "../../services/health/logWorkout";

export const logWorkout = mutation({
  args: {
    at: v.number(),
    durationMinutes: v.number(),
    kind: workoutKindValidator,
    perceivedIntensity: v.optional(v.number()),
  },
  returns: v.id("workouts"),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await logWorkoutHealth(ctx, args);
  },
});
