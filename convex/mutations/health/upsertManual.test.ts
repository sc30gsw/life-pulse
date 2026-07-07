import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  return asSelf;
}

test("inserts a new manual row when none exists for the date", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  const today = todayJst();

  const metricId = await asSelf.mutation(api.mutations.health.upsertManual.upsertManual, {
    bodyBattery: 72,
    dateJst: today,
    todayJst: today,
  });

  const row = await t.run((ctx) => ctx.db.get("healthMetrics", metricId));
  expect(row?.source).toBe("manual");
  expect(row?.bodyBattery).toBe(72);
  expect(row?.dateJst).toBe(today);
});

test("patches the existing non-demo row for the same date, preserving omitted fields", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  const today = todayJst();

  const firstId = await asSelf.mutation(api.mutations.health.upsertManual.upsertManual, {
    bodyBattery: 72,
    dateJst: today,
    todayJst: today,
  });
  const secondId = await asSelf.mutation(api.mutations.health.upsertManual.upsertManual, {
    dateJst: today,
    hrv: 55,
    todayJst: today,
  });

  expect(secondId).toBe(firstId);

  const rows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.bodyBattery).toBe(72);
  expect(rows[0]?.hrv).toBe(55);
});

test("does not overwrite a demo row for the same date — inserts a separate manual row", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  const today = todayJst();
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", { dateJst: today, source: "demo", syncedAt: 0 }),
  );

  const metricId = await asSelf.mutation(api.mutations.health.upsertManual.upsertManual, {
    dateJst: today,
    sleepScore: 80,
    todayJst: today,
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  expect(rows).toHaveLength(2);
  const manualRow = rows.find((row) => row._id === metricId);
  expect(manualRow?.source).toBe("manual");
  expect(manualRow?.sleepScore).toBe(80);
});

test("rejects a future JST date with INVALID_DATE", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  const today = todayJst();
  const tomorrow = addDaysJst(today, 1);

  await expect(
    asSelf.mutation(api.mutations.health.upsertManual.upsertManual, {
      dateJst: tomorrow,
      sleepScore: 80,
      todayJst: today,
    }),
  ).rejects.toThrow();
});

test("rejects a partner (non-self) caller", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  const today = todayJst();

  await expect(
    asPartner.mutation(api.mutations.health.upsertManual.upsertManual, {
      dateJst: today,
      todayJst: today,
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const today = todayJst();

  await expect(
    t.mutation(api.mutations.health.upsertManual.upsertManual, {
      dateJst: today,
      todayJst: today,
    }),
  ).rejects.toThrow();
});
