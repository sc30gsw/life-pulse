import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertAnalyticsRange } from "../../lib/dateRange";
import { mergeByDate } from "./mergeByDate";

type AnalyticsArgs = Record<"fromDateJst" | "toDateJst", Doc<"healthMetrics">["dateJst"]>;

export async function analytics(ctx: QueryCtx, args: AnalyticsArgs) {
  assertAnalyticsRange(args.fromDateJst, args.toDateJst);
  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst))
    .collect();

  return mergeByDate(rows);
}
