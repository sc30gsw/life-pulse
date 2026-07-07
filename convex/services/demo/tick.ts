import { internal } from "../../_generated/api";
import type { MutationCtx } from "../../_generated/server";
import { todayJst } from "../../lib/dateRange";
import { DEMO_TICK_MS } from "../../lib/demoConstants";
import { nextDemoMetric } from "./nextDemoMetric";

// Self-recursive: reschedules itself every DEMO_TICK_MS while demoMode stays
// on, and lets the recursion die (no reschedule) once it observes demoMode
// off — this is what lets setDemoMode(false) cancel the *current* pending
// job instead of racing a stale one (see services/demo/setDemoMode.ts).
export async function tick(ctx: MutationCtx) {
  const settings = await ctx.db.query("appSettings").first();

  if (settings?.demoMode !== true) {
    return;
  }

  const dateJst = todayJst();
  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();
  const existing = rows.find((row) => row.source === "demo") ?? null;
  const metrics = nextDemoMetric(existing ?? undefined, Math.random);

  if (existing === null) {
    await ctx.db.insert("healthMetrics", {
      dateJst,
      source: "demo",
      syncedAt: Date.now(),
      ...metrics,
    });
  } else {
    await ctx.db.patch("healthMetrics", existing._id, { ...metrics, syncedAt: Date.now() });
  }

  const jobId = await ctx.scheduler.runAfter(DEMO_TICK_MS, internal.mutations.demo.tick.tick, {});
  await ctx.db.patch("appSettings", settings._id, { demoJobId: jobId });
}
