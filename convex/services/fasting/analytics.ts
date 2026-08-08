import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertAnalyticsRange } from "../../lib/dateRange";

type DateJst = Doc<"healthMetrics">["dateJst"];
type AnalyticsArgs = Record<"fromDateJst" | "toDateJst", DateJst>;

export async function analytics(ctx: QueryCtx, user: Doc<"appUsers">, args: AnalyticsArgs) {
  assertAnalyticsRange(args.fromDateJst, args.toDateJst);

  return await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status_and_startedAt", (q) =>
      q
        .eq("userId", user._id)
        .eq("status", "ended")
        .gte("startedAt", startOfDayJst(args.fromDateJst))
        .lte("startedAt", endOfDayJst(args.toDateJst)),
    )
    .order("desc")
    .collect();
}

function startOfDayJst(dateJst: DateJst) {
  return Date.parse(`${dateJst}T00:00:00+09:00`);
}

function endOfDayJst(dateJst: DateJst) {
  return Date.parse(`${dateJst}T23:59:59.999+09:00`);
}
