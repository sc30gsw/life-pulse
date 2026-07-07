import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const DATE_JST = "2026-07-07";

test("health rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.dashboard.health.health, { dateJst: DATE_JST }),
  ).rejects.toThrow();
});

test("health ignores demo rows and returns the real metric for the date", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", { dateJst: DATE_JST, source: "demo", syncedAt: 1000 }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 72,
      dateJst: DATE_JST,
      source: "manual",
      syncedAt: 2000,
    }),
  );

  const health = await asSelf.query(api.queries.dashboard.health.health, { dateJst: DATE_JST });

  expect(health?.source).toBe("manual");
  expect(health?.bodyBattery).toBe(72);
});
