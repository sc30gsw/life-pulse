import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const DATE_JST = "2026-07-07";

test("dog rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.dog.dog, { dateJst: DATE_JST })).rejects.toThrow();
});

test("dog returns dog name and merged per-task status for date events", async () => {
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

  await t.run((ctx) => ctx.db.insert("dogs", { name: "ポチ" }));
  const walkTaskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  const mealTaskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝ごはん", sortOrder: 1 }),
  );
  // Archived task must not appear in the board.
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: Date.now(), name: "歯磨き", sortOrder: 2 }),
  );

  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 1000,
      byUserId: selfId,
      dateJst: DATE_JST,
      taskId: walkTaskId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 2000,
      byUserId: partnerId,
      dateJst: DATE_JST,
      taskId: mealTaskId,
    }),
  );

  const dog = await asSelf.query(api.queries.dashboard.dog.dog, { dateJst: DATE_JST });

  expect(dog.dogName).toBe("ポチ");
  expect(dog.tasks).toHaveLength(2);
  const tasksByName = Object.fromEntries(dog.tasks.map((task) => [task.name, task]));
  expect(tasksByName["朝散歩"]?.done).toBe(true);
  expect(tasksByName["朝散歩"]?.byRole).toBe("self");
  expect(tasksByName["朝ごはん"]?.done).toBe(true);
  expect(tasksByName["朝ごはん"]?.byRole).toBe("partner");
});

test("dog marks a task without a matching event as not done", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ポチ" }));
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  const dog = await asSelf.query(api.queries.dashboard.dog.dog, { dateJst: DATE_JST });

  expect(dog.tasks).toHaveLength(1);
  expect(dog.tasks[0]?.done).toBe(false);
  expect(dog.tasks[0]?.at).toBeUndefined();
  expect(dog.tasks[0]?.byRole).toBeUndefined();
});
