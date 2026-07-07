import { sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type DateJst = Doc<"workouts">["dateJst"];
type WorkoutsArgs = Record<"fromDateJst" | "toDateJst", DateJst>;

export async function workouts(ctx: QueryCtx, args: WorkoutsArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const rows = await ctx.db
    .query("workouts")
    .withIndex("by_date", (q) => q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst))
    .collect();

  return sortBy(rows, [(row) => row.at, "desc"]);
}
