import { sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type DateJst = Doc<"workouts">["dateJst"];
type WorkoutListArgs = Record<"fromDateJst" | "toDateJst", DateJst>;

const WORKOUT_LIST_VISIBLE_LIMIT = 4;
const WORKOUT_LIST_MAX_LIMIT = 1000;

export async function workoutList(ctx: QueryCtx, args: WorkoutListArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const rows = await ctx.db
    .query("workouts")
    .withIndex("by_date", (q) => q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst))
    .order("desc")
    .take(WORKOUT_LIST_MAX_LIMIT + 1);

  const workouts = sortBy(rows, [(row) => row.at, "desc"]);

  return {
    hasMore: workouts.length > WORKOUT_LIST_MAX_LIMIT,
    hiddenWorkouts: workouts.slice(WORKOUT_LIST_VISIBLE_LIMIT, WORKOUT_LIST_MAX_LIMIT),
    visibleWorkouts: workouts.slice(0, WORKOUT_LIST_VISIBLE_LIMIT),
  };
}
