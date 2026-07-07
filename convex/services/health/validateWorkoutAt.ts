import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";

export function assertWorkoutAtIsNotFuture(at: Doc<"workouts">["at"]) {
  if (at > Date.now()) {
    throw new ConvexError("INVALID_WORKOUT_AT");
  }
}
