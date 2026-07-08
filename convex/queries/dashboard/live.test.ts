import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const DATE_JST = "2026-07-07";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.live.live, { dateJst: DATE_JST })).rejects.toThrow();
});

test("aggregates session, fasting, blocks, dog events, health, and partner presence for the self viewer", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const partnerId = await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  const sessionId = await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      category: "eikaiwa",
      dateJst: DATE_JST,
      interruptionCount: 0,
      lastResumedAt: Date.now(),
      startedAt: Date.now(),
      status: "active",
      userId: selfId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "early",
      phaseJobIds: [],
      startedAt: Date.now(),
      status: "fasting",
      targetMinutes: 960,
      userId: selfId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("studyBlocks", {
      category: "eikaiwa",
      dateJst: DATE_JST,
      endHm: "06:30",
      plannedMinutes: 30,
      source: "manual",
      startHm: "06:00",
      status: "planned",
      userId: selfId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studyBlocks", {
      category: "toeic",
      dateJst: DATE_JST,
      endHm: "20:30",
      plannedMinutes: 30,
      source: "manual",
      startHm: "20:00",
      status: "planned",
      userId: selfId,
    }),
  );

  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));
  const walkTaskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  const mealTaskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝ごはん", sortOrder: 1 }),
  );

  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: Date.now(),
      byUserId: selfId,
      dateJst: DATE_JST,
      taskId: walkTaskId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: Date.now(),
      byUserId: partnerId,
      dateJst: DATE_JST,
      taskId: mealTaskId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: DATE_JST,
      source: "manual",
      syncedAt: Date.now(),
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("presence", {
      etaHm: "19:30",
      state: "commuting_home",
      updatedAt: Date.now(),
      userId: partnerId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("presence", {
      state: "office",
      updatedAt: Date.now(),
      userId: selfId,
    }),
  );

  const result = await asSelf.query(api.queries.dashboard.live.live, { dateJst: DATE_JST });

  expect(result.viewer.role).toBe("self");
  expect(result.session?._id).toBe(sessionId);
  expect(result.fasting).not.toBeNull();
  expect(result.blocks).toHaveLength(2);

  if (result.dog === null) {
    throw new Error("expected dog");
  }
  expect(result.dog.tasks).toHaveLength(2);
  const tasksByName = Object.fromEntries(result.dog.tasks.map((task) => [task.name, task]));
  expect(tasksByName["朝散歩"]?.done).toBe(true);
  expect(tasksByName["朝散歩"]?.byRole).toBe("self");
  expect(tasksByName["朝ごはん"]?.done).toBe(true);
  expect(tasksByName["朝ごはん"]?.byRole).toBe("partner");

  expect(result.health).not.toBeNull();
  expect(result.health?.source).toBe("manual");

  expect(result.partnerPresence).not.toBeNull();
  expect(result.partnerPresence?.state).toBe("commuting_home");

  expect(result.selfPresence).not.toBeNull();
  expect(result.selfPresence?.state).toBe("office");
});

test("health is null when the only healthMetrics row for the date is demo-sourced", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", { dateJst: DATE_JST, source: "demo", syncedAt: Date.now() }),
  );

  const result = await asSelf.query(api.queries.dashboard.live.live, { dateJst: DATE_JST });

  expect(result.health).toBeNull();
});

test("degrades to empty/null self-scoped fields without throwing when no self appUser exists", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  const result = await asPartner.query(api.queries.dashboard.live.live, { dateJst: DATE_JST });

  expect(result.session).toBeNull();
  expect(result.fasting).toBeNull();
  expect(result.blocks).toEqual([]);
  expect(result.todayActualMinutes).toBe(0);
});

test("dog.dogName reflects the dogs singleton", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  const result = await asSelf.query(api.queries.dashboard.live.live, { dateJst: DATE_JST });
  if (result.dog === null) {
    throw new Error("expected dog");
  }

  expect(result.dog.dogName).toBe("ハマロ");
});
