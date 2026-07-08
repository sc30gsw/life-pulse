import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedThreeTasks(t: ReturnType<typeof convexTest>) {
  const firstId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  const secondId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝ごはん", sortOrder: 1 }),
  );
  const thirdId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "昼ごはん", sortOrder: 2 }),
  );

  return { firstId, secondId, thirdId };
}

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const { firstId } = await seedThreeTasks(t);

  await expect(
    t.mutation(api.mutations.dogTasks.move.move, { direction: "down", taskId: firstId }),
  ).rejects.toThrow();
});

test("self can move a task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const { firstId } = await seedThreeTasks(t);

  await expect(
    asSelf.mutation(api.mutations.dogTasks.move.move, { direction: "down", taskId: firstId }),
  ).resolves.toBeNull();
});

test("partner can move a task", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  const { firstId } = await seedThreeTasks(t);

  await expect(
    asPartner.mutation(api.mutations.dogTasks.move.move, { direction: "down", taskId: firstId }),
  ).resolves.toBeNull();
});

test("moving the first active task up is a no-op", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const { firstId } = await seedThreeTasks(t);

  const before = await asSelf.query(api.queries.dogTasks.list.list, {});
  await asSelf.mutation(api.mutations.dogTasks.move.move, { direction: "up", taskId: firstId });
  const after = await asSelf.query(api.queries.dogTasks.list.list, {});

  expect(after.map((task) => task._id)).toEqual(before.map((task) => task._id));
});

test("moving the last active task down is a no-op", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const { thirdId } = await seedThreeTasks(t);

  const before = await asSelf.query(api.queries.dogTasks.list.list, {});
  await asSelf.mutation(api.mutations.dogTasks.move.move, { direction: "down", taskId: thirdId });
  const after = await asSelf.query(api.queries.dogTasks.list.list, {});

  expect(after.map((task) => task._id)).toEqual(before.map((task) => task._id));
});

test("moving a middle task up swaps it with its predecessor", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const { firstId, secondId, thirdId } = await seedThreeTasks(t);

  await asSelf.mutation(api.mutations.dogTasks.move.move, { direction: "up", taskId: secondId });

  const tasks = await asSelf.query(api.queries.dogTasks.list.list, {});
  expect(tasks.map((task) => task._id)).toEqual([secondId, firstId, thirdId]);
});

test("rejects moving a nonexistent (or archived) task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: Date.now(), name: "歯磨き", sortOrder: 0 }),
  );

  await expect(
    asSelf.mutation(api.mutations.dogTasks.move.move, { direction: "up", taskId }),
  ).rejects.toThrow();
});
