import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { HealthError } from "./errors";

type DeleteWorkoutArgs = Record<"workoutId", Doc<"workouts">["_id"]>;

export async function deleteWorkout(
  ctx: MutationCtx,
  args: DeleteWorkoutArgs,
): Promise<ResultType<void, HealthError>> {
  const workout = await ctx.db.get("workouts", args.workoutId);

  if (workout === null) {
    return Result.err(new HealthError({ code: "WORKOUT_NOT_FOUND", workoutId: args.workoutId }));
  }

  await ctx.db.delete("workouts", args.workoutId);

  return Result.ok();
}
