import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import { HealthError } from "./errors";

export function assertWorkoutAtIsNotFuture(
  at: Doc<"workouts">["at"],
): ResultType<void, HealthError> {
  if (at > Date.now()) {
    return Result.err(new HealthError({ code: "INVALID_WORKOUT_AT" }));
  }

  return Result.ok();
}
