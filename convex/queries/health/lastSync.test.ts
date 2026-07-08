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

test("returns the most recently inserted syncLogs row when multiple exist", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) => ctx.db.insert("syncLogs", { at: 1000, ok: true, source: "garmin" }));
  await t.run((ctx) =>
    ctx.db.insert("syncLogs", {
      at: 2000,
      message: "expired token",
      ok: false,
      source: "garmin",
    }),
  );

  const result = await asSelf.query(api.queries.health.lastSync.lastSync, {});

  expect(result?.at).toBe(2000);
  expect(result?.ok).toBe(false);
  expect(result?.message).toBe("expired token");
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

  await expect(asPartner.query(api.queries.health.lastSync.lastSync, {})).rejects.toThrow();
});
