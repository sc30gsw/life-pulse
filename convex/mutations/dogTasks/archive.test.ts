import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await expect(t.mutation(api.mutations.dogTasks.archive.archive, { taskId })).rejects.toThrow();
});

test("self can archive a task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await asSelf.mutation(api.mutations.dogTasks.archive.archive, { taskId });

  const task = await t.run((ctx) => ctx.db.get("dogTasks", taskId));
  expect(task?.archivedAt).toBeDefined();
});

test("partner can archive a task", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await expect(
    asPartner.mutation(api.mutations.dogTasks.archive.archive, { taskId }),
  ).resolves.toBeNull();
});

test("archiving an already-archived task is a harmless no-op", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: Date.now() - 1000, name: "朝散歩", sortOrder: 0 }),
  );
  const before = await t.run((ctx) => ctx.db.get("dogTasks", taskId));

  await expect(
    asSelf.mutation(api.mutations.dogTasks.archive.archive, { taskId }),
  ).resolves.toBeNull();

  const after = await t.run((ctx) => ctx.db.get("dogTasks", taskId));
  expect(after?.archivedAt).toBe(before?.archivedAt);
});

test("rejects archiving a nonexistent task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  await t.run((ctx) => ctx.db.delete("dogTasks", taskId));

  await expect(
    asSelf.mutation(api.mutations.dogTasks.archive.archive, { taskId }),
  ).rejects.toThrow();
});

test("archived task disappears from list(), but a dogEvents history entry referencing it still resolves its name (soft-delete round-trip)", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", { at: 1000, byUserId: selfId, dateJst: "2026-07-06", taskId }),
  );

  await asSelf.mutation(api.mutations.dogTasks.archive.archive, { taskId });

  const activeTasks = await asSelf.query(api.queries.dogTasks.list.list, {});
  expect(activeTasks.some((task) => task._id === taskId)).toBe(false);

  const history = await asSelf.query(api.queries.dog.history.history, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-07",
  });
  expect(history.days[0]?.events[0]?.taskName).toBe("朝散歩");
});
