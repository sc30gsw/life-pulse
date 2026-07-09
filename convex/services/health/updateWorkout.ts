import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { deriveDateJst } from "./deriveDateJst";
import { HealthError } from "./errors";
import { assertWorkoutAtIsNotFuture } from "./validateWorkoutAt";

type UpdateWorkoutArgs = Pick<
  Doc<"workouts">,
  "at" | "durationMinutes" | "kind" | "perceivedIntensity"
> &
  Record<"workoutId", Doc<"workouts">["_id"]>;

export async function updateWorkout(
  ctx: MutationCtx,
  args: UpdateWorkoutArgs,
): Promise<ResultType<void, HealthError>> {
  const workout = await ctx.db.get("workouts", args.workoutId);

  if (workout === null) {
    return Result.err(new HealthError({ code: "WORKOUT_NOT_FOUND", workoutId: args.workoutId }));
  }

  const workoutAtResult = assertWorkoutAtIsNotFuture(args.at);
  if (Result.isError(workoutAtResult)) {
    return workoutAtResult;
  }

  await ctx.db.patch("workouts", args.workoutId, {
    at: args.at,
    dateJst: deriveDateJst(args.at),
    durationMinutes: args.durationMinutes,
    kind: args.kind,
    perceivedIntensity: args.perceivedIntensity,
  });

  return Result.ok();
}
