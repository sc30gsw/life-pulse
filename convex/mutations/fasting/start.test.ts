import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { selfIdentity, selfUser } from "../../test/fixtures";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity(selfIdentity());
  await t.run((ctx) => ctx.db.insert("appUsers", selfUser()));

  return asSelf;
}

test("uses the default fasting minutes when no appSettings row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.targetMinutes).toBe(DEFAULT_FASTING_MINUTES);
  expect(window?.status).toBe("fasting");
  expect(window?.phase).toBe("early");
});

test("uses appSettings.fastingDefaultMinutes when a row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      fastingDefaultMinutes: 600,
    }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.targetMinutes).toBe(600);
});

test("an explicit targetMinutes argument overrides both defaults", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      fastingDefaultMinutes: 600,
    }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {
    targetMinutes: 30,
  });

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.targetMinutes).toBe(30);
});

test("rejects starting a second fasting window while one is already fasting", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await asSelf.mutation(api.mutations.fasting.start.start, {});

  await expect(asSelf.mutation(api.mutations.fasting.start.start, {})).rejects.toThrow();
});

test("a successful start schedules two phase jobs", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phaseJobIds).toHaveLength(2);
});

test("rejects targetMinutes of 0", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await expect(
    asSelf.mutation(api.mutations.fasting.start.start, { targetMinutes: 0 }),
  ).rejects.toThrow();
});

test("rejects a negative targetMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await expect(
    asSelf.mutation(api.mutations.fasting.start.start, { targetMinutes: -5 }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.fasting.start.start, {})).rejects.toThrow();
});
