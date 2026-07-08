import type { MutationCtx } from "../../_generated/server";
import type { MappedHealthMetrics } from "../garmin/mapDailyMetrics";

// Mirrors upsertManual.ts's non-demo-row find/patch-or-insert pattern, with
// two differences per plan §0-2 (2026-07-08_05-garmin-sync.md): (1) only the
// fields Garmin actually returned for the day are merged in — an existing
// manual value on any field Garmin stayed silent on (mapDailyMetrics.ts maps
// those to `undefined`) is left untouched; (2) one syncLogs row is inserted
// for the whole call, in the same transaction (CVX-15).
export async function upsertFromSync(
  ctx: MutationCtx,
  args: Record<"days", MappedHealthMetrics[]>,
) {
  await Promise.all(args.days.map((day) => upsertOneDay(ctx, day)));

  await ctx.db.insert("syncLogs", { at: Date.now(), ok: true, source: "garmin" });
}

async function upsertOneDay(ctx: MutationCtx, day: MappedHealthMetrics) {
  const { dateJst, ...metrics } = day;
  const definedMetrics = omitUndefinedValues(metrics);

  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", dateJst))
    .collect();
  const existing = rows.find((row) => row.source !== "demo") ?? null;

  if (existing !== null) {
    await ctx.db.patch("healthMetrics", existing._id, {
      ...definedMetrics,
      source: "garmin",
      syncedAt: Date.now(),
    });

    return;
  }

  await ctx.db.insert("healthMetrics", {
    dateJst,
    source: "garmin",
    syncedAt: Date.now(),
    ...definedMetrics,
  });
}

// `ctx.db.patch` treats an explicitly-`undefined` field value as "remove this
// field from the document" (verified against this project's Convex version
// via convex-test), not as "leave it alone". `mapDailyMetrics` always returns
// every key, set to `undefined` when Garmin didn't report it, so those keys
// must be dropped from the patch object entirely — otherwise a merge-patch
// for a field Garmin didn't return would erase an existing manual value
// instead of preserving it (plan §0-2).
function omitUndefinedValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
