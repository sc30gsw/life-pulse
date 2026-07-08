import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { internal } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("inserts an ok:false syncLogs row with a message", async () => {
  const t = convexTest(schema, testModules);

  await t.mutation(internal.mutations.health.recordSyncFailure.recordSyncFailure, {
    message: "invalid token",
  });

  const logs = await t.run((ctx) => ctx.db.query("syncLogs").collect());
  expect(logs).toHaveLength(1);
  expect(logs[0]?.ok).toBe(false);
  expect(logs[0]?.source).toBe("garmin");
  expect(logs[0]?.message).toBe("invalid token");
});

test("inserts an ok:false syncLogs row with no message", async () => {
  const t = convexTest(schema, testModules);

  await t.mutation(internal.mutations.health.recordSyncFailure.recordSyncFailure, {});

  const logs = await t.run((ctx) => ctx.db.query("syncLogs").collect());
  expect(logs).toHaveLength(1);
  expect(logs[0]?.ok).toBe(false);
  expect(logs[0]?.message).toBeUndefined();
});
