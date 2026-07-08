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

  await expect(
    t.mutation(api.mutations.dogTasks.rename.rename, { name: "散歩", taskId }),
  ).rejects.toThrow();
});

test("self can rename a task", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await asSelf.mutation(api.mutations.dogTasks.rename.rename, { name: "散歩(朝)", taskId });

  const task = await t.run((ctx) => ctx.db.get("dogTasks", taskId));
  expect(task?.name).toBe("散歩(朝)");
});

test("partner can rename a task", async () => {
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
    asPartner.mutation(api.mutations.dogTasks.rename.rename, { name: "散歩(朝)", taskId }),
  ).resolves.toBeNull();
});

test("rejects an empty (or whitespace-only) name", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const taskId = await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await expect(
    asSelf.mutation(api.mutations.dogTasks.rename.rename, { name: "  ", taskId }),
  ).rejects.toThrow();
});

test("rejects renaming a nonexistent task", async () => {
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
    asSelf.mutation(api.mutations.dogTasks.rename.rename, { name: "散歩", taskId }),
  ).rejects.toThrow();
});
