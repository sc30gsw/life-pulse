import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedWorkout(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const workoutId = await asSelf.mutation(api.mutations.health.logWorkout.logWorkout, {
    at: Date.parse("2026-07-07T03:00:00.000Z"),
    durationMinutes: 20,
    kind: "hiit",
    perceivedIntensity: 8,
  });

  return { asSelf, workoutId };
}

test("updates a workout's fields, re-derives dateJst from the new `at`, and clears an omitted perceivedIntensity", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, workoutId } = await seedWorkout(t);
  const newAt = Date.parse("2026-07-08T03:00:00.000Z");

  await asSelf.mutation(api.mutations.health.updateWorkout.updateWorkout, {
    at: newAt,
    durationMinutes: 45,
    kind: "walk",
    workoutId,
  });

  const workout = await t.run((ctx) => ctx.db.get("workouts", workoutId));
  expect(workout?.at).toBe(newAt);
  expect(workout?.dateJst).toBe("2026-07-08");
  expect(workout?.kind).toBe("walk");
  expect(workout?.durationMinutes).toBe(45);
  expect(workout?.perceivedIntensity).toBeUndefined();
});

test("rejects updating a nonexistent workout with WORKOUT_NOT_FOUND", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, workoutId } = await seedWorkout(t);
  await t.run((ctx) => ctx.db.delete("workouts", workoutId));

  await expect(
    asSelf.mutation(api.mutations.health.updateWorkout.updateWorkout, {
      at: Date.now(),
      durationMinutes: 10,
      kind: "walk",
      workoutId,
    }),
  ).rejects.toThrow();
});

test("rejects a partner (non-self) caller", async () => {
  const t = convexTest(schema, testModules);
  const { workoutId } = await seedWorkout(t);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.health.updateWorkout.updateWorkout, {
      at: Date.now(),
      durationMinutes: 10,
      kind: "walk",
      workoutId,
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const { workoutId } = await seedWorkout(t);

  await expect(
    t.mutation(api.mutations.health.updateWorkout.updateWorkout, {
      at: Date.now(),
      durationMinutes: 10,
      kind: "walk",
      workoutId,
    }),
  ).rejects.toThrow();
});
