import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { internal } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";

// internalMutation — called directly via t.mutation(internal...), no
// withIdentity, matching the pattern in mutations/sessions/autoAbandon.test.ts
// and mutations/demo/tick.test.ts (only schedulers/actions call this, so
// there is no caller identity to mock).

test("merge-patches an existing manual row, preserving a field Garmin didn't return", async () => {
  const t = convexTest(schema, testModules);
  const today = todayJst();
  const manualId = await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 72,
      dateJst: today,
      source: "manual",
      syncedAt: 0,
    }),
  );

  await t.mutation(internal.mutations.health.upsertFromSync.upsertFromSync, {
    days: [{ dateJst: today, hrv: 55, sleepScore: 80 }],
  });

  const row = await t.run((ctx) => ctx.db.get("healthMetrics", manualId));
  expect(row?.source).toBe("garmin");
  expect(row?.hrv).toBe(55);
  expect(row?.sleepScore).toBe(80);
  // bodyBattery was NOT returned by Garmin in this call (undefined in the
  // day payload) — the existing manual value must survive the merge.
  expect(row?.bodyBattery).toBe(72);
});

test("does not match a demo-source row for the date — inserts a separate garmin row", async () => {
  const t = convexTest(schema, testModules);
  const today = todayJst();
  const demoId = await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 40,
      dateJst: today,
      source: "demo",
      syncedAt: 0,
    }),
  );

  await t.mutation(internal.mutations.health.upsertFromSync.upsertFromSync, {
    days: [{ dateJst: today, sleepScore: 90 }],
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  expect(rows).toHaveLength(2);
  const demoRow = rows.find((row) => row._id === demoId);
  expect(demoRow?.bodyBattery).toBe(40);
  const garminRow = rows.find((row) => row.source === "garmin");
  expect(garminRow?.sleepScore).toBe(90);
});

test("inserts a new garmin row when no non-demo row exists for the date", async () => {
  const t = convexTest(schema, testModules);
  const today = todayJst();

  await t.mutation(internal.mutations.health.upsertFromSync.upsertFromSync, {
    days: [{ dateJst: today, restingHr: 58, steps: 8000 }],
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.source).toBe("garmin");
  expect(rows[0]?.restingHr).toBe(58);
  expect(rows[0]?.steps).toBe(8000);
});

test("inserts exactly one ok:true syncLogs row per call, regardless of day count", async () => {
  const t = convexTest(schema, testModules);
  const today = todayJst();
  const yesterday = addDaysJst(today, -1);

  await t.mutation(internal.mutations.health.upsertFromSync.upsertFromSync, {
    days: [
      { dateJst: yesterday, sleepScore: 70 },
      { dateJst: today, sleepScore: 80 },
    ],
  });

  const logs = await t.run((ctx) => ctx.db.query("syncLogs").collect());
  expect(logs).toHaveLength(1);
  expect(logs[0]?.ok).toBe(true);
  expect(logs[0]?.source).toBe("garmin");
});
