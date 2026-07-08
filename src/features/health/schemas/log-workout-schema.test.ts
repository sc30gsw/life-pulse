import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { LogWorkoutSchema } from "~/features/health/schemas/log-workout-schema";

test("derives an epoch timestamp from a JST wall-clock datetime", () => {
  const result = v.safeParse(LogWorkoutSchema, {
    at: "2026-07-08 20:00:00",
    durationMinutes: 30,
    kind: "hiit",
    perceivedIntensity: 7,
  });

  expect(result.success).toBe(true);
  expect(result.output).toEqual({
    at: Date.UTC(2026, 6, 8, 11, 0, 0),
    durationMinutes: 30,
    kind: "hiit",
    perceivedIntensity: 7,
  });
});

test("allows perceivedIntensity to be omitted", () => {
  const result = v.safeParse(LogWorkoutSchema, {
    at: "2026-07-08 20:00:00",
    durationMinutes: 30,
    kind: "walk",
  });

  expect(result.success).toBe(true);
});

test("rejects a non-integer duration", () => {
  const result = v.safeParse(LogWorkoutSchema, {
    at: "2026-07-08 20:00:00",
    durationMinutes: 30.5,
    kind: "hiit",
  });

  expect(result.success).toBe(false);
});

test("rejects perceivedIntensity above 10", () => {
  const result = v.safeParse(LogWorkoutSchema, {
    at: "2026-07-08 20:00:00",
    durationMinutes: 30,
    kind: "hiit",
    perceivedIntensity: 11,
  });

  expect(result.success).toBe(false);
});

test("rejects an invalid kind", () => {
  const result = v.safeParse(LogWorkoutSchema, {
    at: "2026-07-08 20:00:00",
    durationMinutes: 30,
    kind: "yoga",
  });

  expect(result.success).toBe(false);
});
