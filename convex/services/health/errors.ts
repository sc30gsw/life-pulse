import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type HealthErrorCode = "INVALID_DATE" | "INVALID_WORKOUT_AT" | "WORKOUT_NOT_FOUND";

export class HealthError extends TaggedError("HealthError")<{
  code: HealthErrorCode;
  message: string;
  workoutId?: Id<"workouts">;
}>() {
  constructor(args: { code: HealthErrorCode; message?: string; workoutId?: Id<"workouts"> }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
