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

test("logs a workout and derives its JST date (which crosses the UTC day boundary) from `at`", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  // 2026-07-06T20:00:00Z = 2026-07-07 05:00 JST — a different calendar date in JST than in UTC.
  const at = Date.parse("2026-07-06T20:00:00.000Z");

  const workoutId = await asSelf.mutation(api.mutations.health.logWorkout.logWorkout, {
    at,
    durationMinutes: 20,
    kind: "hiit",
    perceivedIntensity: 8,
  });

  const workout = await t.run((ctx) => ctx.db.get("workouts", workoutId));
  expect(workout?.at).toBe(at);
  expect(workout?.dateJst).toBe("2026-07-07");
  expect(workout?.kind).toBe("hiit");
  expect(workout?.durationMinutes).toBe(20);
  expect(workout?.perceivedIntensity).toBe(8);
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
    asPartner.mutation(api.mutations.health.logWorkout.logWorkout, {
      at: Date.now(),
      durationMinutes: 20,
      kind: "walk",
    }),
  ).rejects.toThrow();
});

test("rejects a future workout timestamp", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  await expect(
    asSelf.mutation(api.mutations.health.logWorkout.logWorkout, {
      at: Date.now() + 60_000,
      durationMinutes: 20,
      kind: "walk",
    }),
  ).rejects.toThrow("INVALID_WORKOUT_AT");
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.health.logWorkout.logWorkout, {
      at: Date.now(),
      durationMinutes: 20,
      kind: "walk",
    }),
  ).rejects.toThrow();
});
