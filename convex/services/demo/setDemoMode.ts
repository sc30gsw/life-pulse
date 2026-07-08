import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DEMO_SEED_DAYS } from "../../lib/demoConstants";
import { DEFAULT_FASTING_MINUTES } from "../appSettings/getFastingDefaultMinutes";
import { seedMetrics } from "./seedMetrics";

type SetDemoModeArgs = Record<"enabled", Doc<"appSettings">["demoMode"]> &
  Record<"todayJst", Doc<"healthMetrics">["dateJst"]>;

export async function setDemoMode(ctx: MutationCtx, args: SetDemoModeArgs) {
  const settings = await ctx.db.query("appSettings").first();

  if (args.enabled) {
    await enableDemoMode(ctx, settings, args.todayJst);
    return;
  }

  await disableDemoMode(ctx, settings);
}

async function enableDemoMode(
  ctx: MutationCtx,
  settings: Doc<"appSettings"> | null,
  todayJst: Doc<"healthMetrics">["dateJst"],
) {
  if (settings?.demoMode === true) {
    return; // idempotent ON -> ON
  }

  const seedRows = seedMetrics(todayJst, DEMO_SEED_DAYS, Math.random);
  await Promise.all(
    seedRows.map((row) => ctx.db.insert("healthMetrics", { ...row, syncedAt: Date.now() })),
  );

  const jobId = await ctx.scheduler.runAfter(0, internal.mutations.demo.tick.tick, {});

  if (settings === null) {
    await ctx.db.insert("appSettings", {
      demoJobId: jobId,
      demoMode: true,
      fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
    });
    return;
  }

  await ctx.db.patch("appSettings", settings._id, { demoJobId: jobId, demoMode: true });
}

async function disableDemoMode(ctx: MutationCtx, settings: Doc<"appSettings"> | null) {
  if (settings === null || settings.demoMode === false) {
    return; // idempotent OFF -> OFF
  }

  if (settings.demoJobId !== undefined) {
    await ctx.scheduler.cancel(settings.demoJobId);
  }

  // Full-table collect is bounded: healthMetrics holds only a handful of rows
  // per day (garmin/manual/demo), well under CVX-11's ~1000-row guidance.
  const rows = await ctx.db.query("healthMetrics").collect();
  const demoRows = rows.filter((row) => row.source === "demo");
  await Promise.all(demoRows.map((row) => ctx.db.delete("healthMetrics", row._id)));

  await ctx.db.patch("appSettings", settings._id, { demoJobId: undefined, demoMode: false });
}
