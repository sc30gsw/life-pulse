import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  return asSelf;
}

test("returns rows across a date range sorted ascending, excluding legacy demo rows", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-02",
      sleepScore: 70,
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-01",
      sleepScore: 60,
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-01",
      sleepScore: 90,
      source: "demo",
      syncedAt: 0,
    }),
  );

  const rows = await asSelf.query(api.queries.health.range.range, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-02",
  });

  expect(rows.map((row) => row.dateJst)).toEqual(["2026-07-01", "2026-07-02"]);
  expect(rows[0]?.source).toBe("manual");
  expect(rows[0]?.sleepScore).toBe(60);
});

test("prefers garmin over manual while ignoring legacy demo rows", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-01",
      sleepScore: 60,
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-01",
      sleepScore: 90,
      source: "demo",
      syncedAt: 1,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-07-01",
      sleepScore: 80,
      source: "garmin",
      syncedAt: 2,
    }),
  );

  const rows = await asSelf.query(api.queries.health.range.range, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-01",
  });

  expect(rows).toHaveLength(1);
  expect(rows[0]?.source).toBe("garmin");
  expect(rows[0]?.sleepScore).toBe(80);
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

  await expect(
    asPartner.query(api.queries.health.range.range, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.health.range.range, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});
