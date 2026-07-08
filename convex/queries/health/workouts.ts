import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireSelf } from "../../lib/auth";
import { workoutKindValidator } from "../../lib/validators";
import { workouts as workoutsService } from "../../services/health/workouts";

export const workouts = query({
  args: { fromDateJst: v.string(), toDateJst: v.string() },
  returns: v.array(
    v.object({
      _creationTime: v.number(),
      _id: v.id("workouts"),
      at: v.number(),
      dateJst: v.string(),
      durationMinutes: v.number(),
      kind: workoutKindValidator,
      perceivedIntensity: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireSelf(ctx);

    return await workoutsService(ctx, args);
  },
});
