import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { deriveDateJst } from "./deriveDateJst";
import { HealthError } from "./errors";
import { assertWorkoutAtIsNotFuture } from "./validateWorkoutAt";

type LogWorkoutArgs = Pick<
  Doc<"workouts">,
  "at" | "durationMinutes" | "kind" | "perceivedIntensity"
>;

export async function logWorkout(
  ctx: MutationCtx,
  args: LogWorkoutArgs,
): Promise<ResultType<Doc<"workouts">["_id"], HealthError>> {
  const workoutAtResult = assertWorkoutAtIsNotFuture(args.at);
  if (Result.isError(workoutAtResult)) {
    return workoutAtResult;
  }

  return Result.ok(
    await ctx.db.insert("workouts", {
      at: args.at,
      dateJst: deriveDateJst(args.at),
      durationMinutes: args.durationMinutes,
      kind: args.kind,
      perceivedIntensity: args.perceivedIntensity,
    }),
  );
}
