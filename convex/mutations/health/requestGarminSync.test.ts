import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("schedules a 28-day backfill before the first successful Garmin sync", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asSelf.mutation(api.mutations.health.requestGarminSync.requestGarminSync, {});

  const jobs = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
  expect(jobs).toHaveLength(1);
  expect(jobs[0].name).toBe("actions/garmin/syncDaily:backfill");
});

test("schedules the daily two-day sync after a successful Garmin sync", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run(async (ctx) => {
    await ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" });
    await ctx.db.insert("syncLogs", { at: 1000, ok: true, source: "garmin" });
  });

  await asSelf.mutation(api.mutations.health.requestGarminSync.requestGarminSync, {});

  const jobs = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
  expect(jobs).toHaveLength(1);
  expect(jobs[0].name).toBe("actions/garmin/syncDaily:syncDaily");
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
    asPartner.mutation(api.mutations.health.requestGarminSync.requestGarminSync, {}),
  ).rejects.toThrow();
});
