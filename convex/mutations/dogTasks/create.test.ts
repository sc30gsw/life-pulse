import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.dogTasks.create.create, { name: "散歩" })).rejects.toThrow();
});

test("self can create a task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.dogTasks.create.create, { name: "散歩" }),
  ).resolves.toBeDefined();
});

test("partner can create a task", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.dogTasks.create.create, { name: "散歩" }),
  ).resolves.toBeDefined();
});

test("rejects an empty (or whitespace-only) name", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.dogTasks.create.create, { name: "   " }),
  ).rejects.toThrow();
});

test("assigns sortOrder 0 when the table is empty", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  const taskId = await asSelf.mutation(api.mutations.dogTasks.create.create, { name: "散歩" });
  const task = await t.run((ctx) => ctx.db.get("dogTasks", taskId));

  expect(task?.sortOrder).toBe(0);
});

test("assigns sortOrder as max(sortOrder) + 1 across active and archived tasks", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  // Archived, but still counts toward the max so its sortOrder is never reused.
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: Date.now(), name: "歯磨き", sortOrder: 5 }),
  );

  const taskId = await asSelf.mutation(api.mutations.dogTasks.create.create, { name: "夜ごはん" });
  const task = await t.run((ctx) => ctx.db.get("dogTasks", taskId));

  expect(task?.sortOrder).toBe(6);
});
