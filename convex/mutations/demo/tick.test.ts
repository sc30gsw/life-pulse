import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api, internal } from "../../_generated/api";
import { todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("tick patches today's demo row in place and reschedules, superseding the previous job pointer", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  const today = todayJst();
  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: true,
    todayJst: today,
  });

  const settingsBeforeTick = await t.run((ctx) => ctx.db.query("appSettings").first());
  const jobIdBeforeTick = settingsBeforeTick?.demoJobId;
  const rowsBeforeTick = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  const demoRowBeforeTick = rowsBeforeTick.find((row) => row.source === "demo");
  expect(demoRowBeforeTick).toBeDefined();

  await t.mutation(internal.mutations.demo.tick.tick, {});

  const settingsAfterTick = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settingsAfterTick?.demoJobId).toBeDefined();
  expect(settingsAfterTick?.demoJobId).not.toBe(jobIdBeforeTick);

  const rowsAfterTick = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) => q.eq("dateJst", today))
      .collect(),
  );
  const demoRowAfterTick = rowsAfterTick.find((row) => row.source === "demo");
  expect(demoRowAfterTick).toBeDefined();
  expect(demoRowAfterTick?._id).toBe(demoRowBeforeTick?._id);
});

test("tick is a no-op (no writes, no reschedule) when demoMode is false", async () => {
  const t = convexTest(schema, testModules);
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      demoMode: false,
      dogName: "ハマロ",
      fastingDefaultMinutes: 960,
    }),
  );

  await t.mutation(internal.mutations.demo.tick.tick, {});

  const settings = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settings?.demoMode).toBe(false);
  expect(settings?.demoJobId).toBeUndefined();

  const rows = await t.run((ctx) => ctx.db.query("healthMetrics").collect());
  expect(rows).toHaveLength(0);
});

test("tick is a no-op when there is no appSettings row", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(internal.mutations.demo.tick.tick, {})).resolves.not.toThrow();

  const rows = await t.run((ctx) => ctx.db.query("healthMetrics").collect());
  expect(rows).toHaveLength(0);
});
