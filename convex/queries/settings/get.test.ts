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

test("returns defaults when no appSettings row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  const settings = await asSelf.query(api.queries.settings.get.get, {});

  expect(settings).toEqual({
    demoMode: false,
    dogName: "ハマロ",
    fastingDefaultMinutes: 960,
  });
});

test("returns the actual row when one exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("appSettings", { demoMode: true, dogName: "ポチ", fastingDefaultMinutes: 600 }),
  );

  const settings = await asSelf.query(api.queries.settings.get.get, {});

  expect(settings).toEqual({
    demoMode: true,
    dogName: "ポチ",
    fastingDefaultMinutes: 600,
  });
});

test("rejects a non-self identity", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(asPartner.query(api.queries.settings.get.get, {})).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.settings.get.get, {})).rejects.toThrow();
});
