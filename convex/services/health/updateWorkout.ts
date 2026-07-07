import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { deriveDateJst } from "./deriveDateJst";

type UpdateWorkoutArgs = Pick<
  Doc<"workouts">,
  "at" | "durationMinutes" | "kind" | "perceivedIntensity"
> &
  Record<"workoutId", Doc<"workouts">["_id"]>;

export async function updateWorkout(ctx: MutationCtx, args: UpdateWorkoutArgs) {
  const workout = await ctx.db.get("workouts", args.workoutId);

  if (workout === null) {
    throw new ConvexError("WORKOUT_NOT_FOUND");
  }

  await ctx.db.patch("workouts", args.workoutId, {
    at: args.at,
    dateJst: deriveDateJst(args.at),
    durationMinutes: args.durationMinutes,
    kind: args.kind,
    perceivedIntensity: args.perceivedIntensity,
  });
}
