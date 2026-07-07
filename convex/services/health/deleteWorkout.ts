import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type DeleteWorkoutArgs = Record<"workoutId", Doc<"workouts">["_id"]>;

export async function deleteWorkout(ctx: MutationCtx, args: DeleteWorkoutArgs) {
  const workout = await ctx.db.get("workouts", args.workoutId);

  if (workout === null) {
    throw new ConvexError("WORKOUT_NOT_FOUND");
  }

  await ctx.db.delete("workouts", args.workoutId);
}
