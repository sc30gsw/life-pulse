import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("uses the default 960 minutes when no appSettings row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.targetMinutes).toBe(960);
  expect(window?.status).toBe("fasting");
  expect(window?.phase).toBe("early");
});

test("uses appSettings.fastingDefaultMinutes when a row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      demoMode: false,
      fastingDefaultMinutes: 600,
    }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.targetMinutes).toBe(600);
});

test("an explicit targetMinutes argument overrides both defaults", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("appSettings", {
      demoMode: false,
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
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asSelf.mutation(api.mutations.fasting.start.start, {});

  await expect(asSelf.mutation(api.mutations.fasting.start.start, {})).rejects.toThrow();
});

test("a successful start schedules two phase jobs", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const windowId = await asSelf.mutation(api.mutations.fasting.start.start, {});

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phaseJobIds).toHaveLength(2);
});

test("rejects targetMinutes of 0", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.fasting.start.start, { targetMinutes: 0 }),
  ).rejects.toThrow();
});

test("rejects a negative targetMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.fasting.start.start, { targetMinutes: -5 }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.fasting.start.start, {})).rejects.toThrow();
});
