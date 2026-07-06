import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("the first call inserts exactly one presence row with the given state", async () => {
  const t = convexTest(schema, testModules);
  const asUser = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asUser.mutation(api.mutations.partnerStatus.setStatus.setStatus, { state: "office" });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.state).toBe("office");
});

test("a second call with a different state patches the same row instead of inserting a new one", async () => {
  const t = convexTest(schema, testModules);
  const asUser = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asUser.mutation(api.mutations.partnerStatus.setStatus.setStatus, { state: "office" });
  await asUser.mutation(api.mutations.partnerStatus.setStatus.setStatus, { state: "home" });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.state).toBe("home");
});

test('state "home" with an etaHm clears the stored etaHm', async () => {
  const t = convexTest(schema, testModules);
  const asUser = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asUser.mutation(api.mutations.partnerStatus.setStatus.setStatus, {
    state: "home",
    etaHm: "20:30",
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  );
  expect(rows[0]?.etaHm).toBeUndefined();
});

test('state "commuting_home" keeps the given etaHm', async () => {
  const t = convexTest(schema, testModules);
  const asUser = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asUser.mutation(api.mutations.partnerStatus.setStatus.setStatus, {
    state: "commuting_home",
    etaHm: "20:30",
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  );
  expect(rows[0]?.etaHm).toBe("20:30");
});

test("an unauthenticated call rejects", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.partnerStatus.setStatus.setStatus, { state: "office" }),
  ).rejects.toThrow();
});
