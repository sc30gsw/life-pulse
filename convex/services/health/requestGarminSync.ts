import { internal } from "../../_generated/api";
import type { MutationCtx } from "../../_generated/server";

const GARMIN_INITIAL_SYNC_DAYS = 28;

export async function requestGarminSync(ctx: MutationCtx) {
  const garminMetrics = await ctx.db
    .query("healthMetrics")
    .withIndex("by_source", (q) => q.eq("source", "garmin"))
    .take(GARMIN_INITIAL_SYNC_DAYS);

  if (garminMetrics.length < GARMIN_INITIAL_SYNC_DAYS) {
    await ctx.scheduler.runAfter(0, internal.actions.garmin.syncDaily.backfill, {});
    return;
  }

  await ctx.scheduler.runAfter(0, internal.actions.garmin.syncDaily.syncDaily, {});
}
