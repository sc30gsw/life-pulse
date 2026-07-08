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

test("lazy-creates the appSettings row on first call with partial input", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await asSelf.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 600 });

  const settings = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settings?.demoMode).toBe(false);
  expect(settings?.fastingDefaultMinutes).toBe(600);
});

test("patches an existing row without touching demoMode or demoJobId", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      demoJobId: undefined,
      demoMode: true,
      fastingDefaultMinutes: 960,
    }),
  );

  await asSelf.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 600 });

  const settings = await t.run((ctx) => ctx.db.query("appSettings").first());
  expect(settings?.demoMode).toBe(true);
  expect(settings?.fastingDefaultMinutes).toBe(600);
});

test("rejects a non-positive fastingDefaultMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await expect(
    asSelf.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 0 }),
  ).rejects.toThrow();
});

test("rejects a non-integer fastingDefaultMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await expect(
    asSelf.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 30.5 }),
  ).rejects.toThrow();
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

  await expect(
    asPartner.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 600 }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.settings.update.update, { fastingDefaultMinutes: 600 }),
  ).rejects.toThrow();
});
