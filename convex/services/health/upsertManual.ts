import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type UpsertManualArgs = Pick<
  Doc<"healthMetrics">,
  "bodyBattery" | "dateJst" | "hrv" | "restingHr" | "sleepMinutes" | "sleepScore" | "steps"
> &
  Record<"todayJst", Doc<"healthMetrics">["dateJst"]>;

export async function upsertManual(ctx: MutationCtx, args: UpsertManualArgs) {
  const { dateJst, todayJst, ...metrics } = args;

  if (dateJst > todayJst) {
    throw new ConvexError("INVALID_DATE");
  }

  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();
  const existing = rows.find((row) => row.source !== "demo") ?? null;

  if (existing !== null) {
    await ctx.db.patch("healthMetrics", existing._id, { ...metrics, syncedAt: Date.now() });

    return existing._id;
  }

  return await ctx.db.insert("healthMetrics", {
    dateJst,
    source: "manual",
    syncedAt: Date.now(),
    ...metrics,
  });
}
