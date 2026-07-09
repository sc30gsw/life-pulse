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

test("returns a visible slice and hidden remainder in recent-first order", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  for (const [index, at] of [1_000, 2_000, 3_000, 4_000, 5_000].entries()) {
    await t.run((ctx) =>
      ctx.db.insert("workouts", {
        at,
        dateJst: index < 3 ? "2026-07-01" : "2026-07-02",
        durationMinutes: 10 + index,
        kind: "hiit",
      }),
    );
  }

  const result = await asSelf.query(api.queries.health.workoutList.workoutList, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-02",
  });

  expect(result.visibleWorkouts.map((row) => row.at)).toEqual([5_000, 4_000, 3_000, 2_000]);
  expect(result.hiddenWorkouts.map((row) => row.at)).toEqual([1_000]);
  expect(result.hasMore).toBe(false);
});

test("rejects a partner caller", async () => {
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
    asPartner.query(api.queries.health.workoutList.workoutList, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated caller", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.health.workoutList.workoutList, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-02",
    }),
  ).rejects.toThrow();
});
