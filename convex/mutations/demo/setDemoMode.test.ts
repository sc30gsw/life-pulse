import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const TODAY_JST = "2026-07-07";

test("enabling demo mode creates appSettings, seeds 15 demo rows, and schedules a tick job", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: true,
    todayJst: TODAY_JST,
  });

  const settings = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settings?.demoMode).toBe(true);
  expect(settings?.demoJobId).toBeDefined();

  const demoRows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .collect()
      .then((rows) => rows.filter((row) => row.source === "demo")),
  );
  expect(demoRows).toHaveLength(15);

  const jobId = settings?.demoJobId;
  if (jobId !== undefined) {
    const job = await t.run((ctx) => ctx.db.system.get(jobId));
    expect(job?.state.kind).toBe("pending");
  }
});

test("enabling demo mode twice is a no-op the second time (ON -> ON)", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: true,
    todayJst: TODAY_JST,
  });
  const settingsAfterFirst = await t.run((ctx) => ctx.db.query("appSettings").first());

  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: true,
    todayJst: TODAY_JST,
  });
  const settingsAfterSecond = await t.run((ctx) => ctx.db.query("appSettings").first());

  const demoRows = await t.run((ctx) =>
    ctx.db
      .query("healthMetrics")
      .collect()
      .then((rows) => rows.filter((row) => row.source === "demo")),
  );
  expect(demoRows).toHaveLength(15);
  expect(settingsAfterSecond?.demoJobId).toBe(settingsAfterFirst?.demoJobId);
});

test("disabling demo mode cancels the job and deletes demo rows, leaving a manual row untouched", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 70,
      dateJst: TODAY_JST,
      source: "manual",
      syncedAt: 1000,
    }),
  );

  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: true,
    todayJst: TODAY_JST,
  });
  const settingsWhileOn = await t.run((ctx) => ctx.db.query("appSettings").first());
  const jobId = settingsWhileOn?.demoJobId;

  await asSelf.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
    enabled: false,
    todayJst: TODAY_JST,
  });

  const settingsAfterOff = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settingsAfterOff?.demoMode).toBe(false);
  expect(settingsAfterOff?.demoJobId).toBeUndefined();

  if (jobId !== undefined) {
    const job = await t.run((ctx) => ctx.db.system.get(jobId));
    expect(job?.state.kind).toBe("canceled");
  }

  const rows = await t.run((ctx) => ctx.db.query("healthMetrics").collect());
  expect(rows.filter((row) => row.source === "demo")).toHaveLength(0);
  expect(rows.filter((row) => row.source === "manual")).toHaveLength(1);
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.demo.setDemoMode.setDemoMode, {
      enabled: true,
      todayJst: TODAY_JST,
    }),
  ).rejects.toThrow();
});
