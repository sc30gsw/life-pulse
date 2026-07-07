import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("history rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.fasting.history.history, {})).rejects.toThrow();
});

test("history returns only ended windows, never fasting ones", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const endedId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      actualMinutes: 960,
      endedAt: 2_000,
      phase: "goal",
      phaseJobIds: [],
      startedAt: 1_000,
      status: "ended",
      targetMinutes: 960,
      userId: selfId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "early",
      phaseJobIds: [],
      startedAt: 3_000,
      status: "fasting",
      targetMinutes: 960,
      userId: selfId,
    }),
  );

  const history = await asSelf.query(api.queries.fasting.history.history, {});

  expect(history.length).toBe(1);
  expect(history[0]?._id).toBe(endedId);
  expect(history[0]?.status).toBe("ended");
});

test("history orders results newest-first", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const olderId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      actualMinutes: 960,
      endedAt: 2_000,
      phase: "goal",
      phaseJobIds: [],
      startedAt: 1_000,
      status: "ended",
      targetMinutes: 960,
      userId: selfId,
    }),
  );
  const newerId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      actualMinutes: 500,
      endedAt: 5_000,
      phase: "fatburn",
      phaseJobIds: [],
      startedAt: 4_000,
      status: "ended",
      targetMinutes: 720,
      userId: selfId,
    }),
  );

  const history = await asSelf.query(api.queries.fasting.history.history, {});

  expect(history.map((window) => window._id)).toEqual([newerId, olderId]);
});

test("history shows the self user's history even when called as a partner", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  const selfEndedId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      actualMinutes: 960,
      endedAt: 2_000,
      phase: "goal",
      phaseJobIds: [],
      startedAt: 1_000,
      status: "ended",
      targetMinutes: 960,
      userId: selfId,
    }),
  );

  const history = await asPartner.query(api.queries.fasting.history.history, {});

  expect(history.length).toBe(1);
  expect(history[0]?._id).toBe(selfEndedId);
});

test("history returns only the 30 most recent ended windows", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  const total = 35;
  for (let i = 0; i < total; i += 1) {
    await t.run((ctx) =>
      ctx.db.insert("fastingWindows", {
        actualMinutes: 960,
        endedAt: (i + 1) * 1_000,
        phase: "goal",
        phaseJobIds: [],
        startedAt: i * 1_000,
        status: "ended",
        targetMinutes: 960,
        userId: selfId,
      }),
    );
  }

  const history = await asSelf.query(api.queries.fasting.history.history, {});

  expect(history.length).toBe(30);
});
