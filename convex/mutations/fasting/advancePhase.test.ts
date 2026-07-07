import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { internal } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("advances phase from early to fatburn", async () => {
  const t = convexTest(schema, testModules);
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const windowId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "early",
      phaseJobIds: [],
      startedAt: 0,
      status: "fasting",
      targetMinutes: 960,
      userId,
    }),
  );

  await t.mutation(internal.mutations.fasting.advancePhase.advancePhase, {
    to: "fatburn",
    windowId,
  });

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phase).toBe("fatburn");
});

test("advances phase from fatburn to goal", async () => {
  const t = convexTest(schema, testModules);
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const windowId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "fatburn",
      phaseJobIds: [],
      startedAt: 0,
      status: "fasting",
      targetMinutes: 960,
      userId,
    }),
  );

  await t.mutation(internal.mutations.fasting.advancePhase.advancePhase, {
    to: "goal",
    windowId,
  });

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phase).toBe("goal");
});

test("is a no-op when the window has already ended", async () => {
  const t = convexTest(schema, testModules);
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const windowId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      actualMinutes: 960,
      endedAt: 960 * 60_000,
      phase: "goal",
      phaseJobIds: [],
      startedAt: 0,
      status: "ended",
      targetMinutes: 960,
      userId,
    }),
  );

  await t.mutation(internal.mutations.fasting.advancePhase.advancePhase, {
    to: "goal",
    windowId,
  });

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phase).toBe("goal");
});

test("is a no-op when demoting from goal back to fatburn", async () => {
  const t = convexTest(schema, testModules);
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const windowId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "goal",
      phaseJobIds: [],
      startedAt: 0,
      status: "fasting",
      targetMinutes: 720,
      userId,
    }),
  );

  await t.mutation(internal.mutations.fasting.advancePhase.advancePhase, {
    to: "fatburn",
    windowId,
  });

  const window = await t.run((ctx) => ctx.db.get("fastingWindows", windowId));
  expect(window?.phase).toBe("goal");
});
