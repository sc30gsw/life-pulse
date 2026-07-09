import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dogTasks.list.list, {})).rejects.toThrow();
});

test("self can list active tasks", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );

  await expect(asSelf.query(api.queries.dogTasks.list.list, {})).resolves.toBeDefined();
});

test("partner can list active tasks", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(asPartner.query(api.queries.dogTasks.list.list, {})).resolves.toBeDefined();
});

test("returns only active tasks sorted by sortOrder ascending", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "夜ごはん", sortOrder: 1 }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: undefined, name: "朝散歩", sortOrder: 0 }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogTasks", { archivedAt: Date.now(), name: "歯磨き", sortOrder: 2 }),
  );

  const tasks = await asSelf.query(api.queries.dogTasks.list.list, {});

  expect(tasks.map((task) => task.name)).toEqual(["朝散歩", "夜ごはん"]);
});
