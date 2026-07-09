import { internal } from "../../_generated/api";
import type { MutationCtx } from "../../_generated/server";

export async function requestGarminSync(ctx: MutationCtx) {
  const latestGarminSuccess = (
    await ctx.db
      .query("syncLogs")
      .withIndex("by_source_and_ok", (q) => q.eq("source", "garmin").eq("ok", true))
      .order("desc")
      .take(1)
  )[0];

  if (latestGarminSuccess === undefined) {
    await ctx.scheduler.runAfter(0, internal.actions.garmin.syncDaily.backfill, {});
    return;
  }

  await ctx.scheduler.runAfter(0, internal.actions.garmin.syncDaily.syncDaily, {});
}
