import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  return asSelf;
}

test("returns workouts within the date range ordered by `at` descending", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 1_000,
      dateJst: "2026-07-01",
      durationMinutes: 20,
      kind: "hiit",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 3_000,
      dateJst: "2026-07-02",
      durationMinutes: 30,
      kind: "walk",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 2_000,
      dateJst: "2026-07-01",
      durationMinutes: 10,
      kind: "other",
    }),
  );
  // outside the queried range — must be excluded
  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 9_000,
      dateJst: "2026-07-10",
      durationMinutes: 5,
      kind: "walk",
    }),
  );

  const rows = await asSelf.query(api.queries.health.workouts.workouts, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-02",
  });

  expect(rows.map((row) => row.at)).toEqual([3_000, 2_000, 1_000]);
});

test("rejects a partner (non-self) caller", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.query(api.queries.health.workouts.workouts, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.health.workouts.workouts, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});
