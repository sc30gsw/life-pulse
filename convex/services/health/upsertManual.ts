import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { HealthError } from "./errors";

type UpsertManualArgs = Pick<
  Doc<"healthMetrics">,
  "bodyBattery" | "dateJst" | "hrv" | "restingHr" | "sleepMinutes" | "sleepScore" | "steps"
> &
  Record<"todayJst", Doc<"healthMetrics">["dateJst"]>;

export async function upsertManual(
  ctx: MutationCtx,
  args: UpsertManualArgs,
): Promise<ResultType<Doc<"healthMetrics">["_id"], HealthError>> {
  const { dateJst, todayJst, ...metrics } = args;

  if (dateJst > todayJst) {
    return Result.err(new HealthError({ code: "INVALID_DATE" }));
  }

  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();
  const existing = rows.find((row) => row.source !== "demo") ?? null;

  if (existing !== null) {
    await ctx.db.patch("healthMetrics", existing._id, {
      ...metrics,
      source: "manual",
      syncedAt: Date.now(),
    });

    return Result.ok(existing._id);
  }

  return Result.ok(
    await ctx.db.insert("healthMetrics", {
      dateJst,
      source: "manual",
      syncedAt: Date.now(),
      ...metrics,
    }),
  );
}
