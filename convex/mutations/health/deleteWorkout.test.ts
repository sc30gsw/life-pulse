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
    at: Date.now(),
    durationMinutes: 20,
    kind: "hiit",
  });

  return { asSelf, workoutId };
}

test("deletes an existing workout", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, workoutId } = await seedWorkout(t);

  await asSelf.mutation(api.mutations.health.deleteWorkout.deleteWorkout, { workoutId });

  const workout = await t.run((ctx) => ctx.db.get("workouts", workoutId));
  expect(workout).toBeNull();
});

test("rejects deleting a nonexistent workout with WORKOUT_NOT_FOUND", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, workoutId } = await seedWorkout(t);
  await t.run((ctx) => ctx.db.delete("workouts", workoutId));

  await expect(
    asSelf.mutation(api.mutations.health.deleteWorkout.deleteWorkout, { workoutId }),
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
    asPartner.mutation(api.mutations.health.deleteWorkout.deleteWorkout, { workoutId }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const { workoutId } = await seedWorkout(t);

  await expect(
    t.mutation(api.mutations.health.deleteWorkout.deleteWorkout, { workoutId }),
  ).rejects.toThrow();
});
