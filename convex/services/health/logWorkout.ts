import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { deriveDateJst } from "./deriveDateJst";
import { assertWorkoutAtIsNotFuture } from "./validateWorkoutAt";

type LogWorkoutArgs = Pick<
  Doc<"workouts">,
  "at" | "durationMinutes" | "kind" | "perceivedIntensity"
>;

export async function logWorkout(ctx: MutationCtx, args: LogWorkoutArgs) {
  assertWorkoutAtIsNotFuture(args.at);

  return await ctx.db.insert("workouts", {
    at: args.at,
    dateJst: deriveDateJst(args.at),
    durationMinutes: args.durationMinutes,
    kind: args.kind,
    perceivedIntensity: args.perceivedIntensity,
  });
}
