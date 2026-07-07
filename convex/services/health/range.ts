import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";
import { mergeByDate } from "./mergeByDate";

type DateJst = Doc<"healthMetrics">["dateJst"];
type RangeArgs = Record<"fromDateJst" | "toDateJst", DateJst>;

export async function range(ctx: QueryCtx, args: RangeArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const [rows, settings] = await Promise.all([
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) =>
        q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
      )
      .collect(),
    ctx.db.query("appSettings").first(),
  ]);

  return mergeByDate(rows, settings?.demoMode ?? false);
}
