import { expect, test } from "vite-plus/test";

import { addDaysJst } from "../../lib/dateRange";
import { DEMO_METRIC_RANGES, DEMO_STEPS_RANGE } from "../../lib/demoConstants";
import { seedMetrics } from "./seedMetrics";

function cyclicRand(sequence: number[]) {
  let index = 0;

  return () => sequence[index++ % sequence.length];
}

test("returns days + 1 rows", () => {
  const rows = seedMetrics("2026-07-15", 14, cyclicRand([0.3, 0.6, 0.1]));

  expect(rows).toHaveLength(15);
});

test("dateJst values form the consecutive range ending at todayJst", () => {
  const todayJst = "2026-07-15";
  const days = 14;
  const rows = seedMetrics(todayJst, days, cyclicRand([0.5]));

  expect(rows.map((row) => row.dateJst)).toEqual(
    Array.from({ length: days + 1 }, (_, offset) => addDaysJst(todayJst, offset - days)),
  );
  expect(rows[0]?.dateJst).toBe(addDaysJst(todayJst, -days));
  expect(rows.at(-1)?.dateJst).toBe(todayJst);
});

test("every row uses the demo source", () => {
  const rows = seedMetrics("2026-07-15", 5, cyclicRand([0.5]));

  expect(rows.every((row) => row.source === "demo")).toBe(true);
});

test("is deterministic given the same rand sequence", () => {
  const sequence = [0.1, 0.9, 0.4, 0.6, 0.2, 0.8, 0.35, 0.72];

  expect(seedMetrics("2026-07-15", 14, cyclicRand(sequence))).toEqual(
    seedMetrics("2026-07-15", 14, cyclicRand(sequence)),
  );
});

test("all metric values stay within their clamp bounds", () => {
  const rows = seedMetrics("2026-07-15", 14, cyclicRand([0, 0.25, 0.5, 0.75, 1]));

  for (const row of rows) {
    expect(row.sleepScore).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.sleepScore.min);
    expect(row.sleepScore).toBeLessThanOrEqual(DEMO_METRIC_RANGES.sleepScore.max);
    expect(row.sleepMinutes).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.sleepMinutes.min);
    expect(row.sleepMinutes).toBeLessThanOrEqual(DEMO_METRIC_RANGES.sleepMinutes.max);
    expect(row.bodyBattery).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.bodyBattery.min);
    expect(row.bodyBattery).toBeLessThanOrEqual(DEMO_METRIC_RANGES.bodyBattery.max);
    expect(row.hrv).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.hrv.min);
    expect(row.hrv).toBeLessThanOrEqual(DEMO_METRIC_RANGES.hrv.max);
    expect(row.restingHr).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.restingHr.min);
    expect(row.restingHr).toBeLessThanOrEqual(DEMO_METRIC_RANGES.restingHr.max);
    expect(row.steps).toBeGreaterThanOrEqual(DEMO_STEPS_RANGE.min);
    expect(row.steps).toBeLessThanOrEqual(DEMO_STEPS_RANGE.max);
  }
});

test("does not stamp syncedAt (left for the calling mutation to set)", () => {
  const rows = seedMetrics("2026-07-15", 3, cyclicRand([0.5]));

  expect(rows.every((row) => !("syncedAt" in row))).toBe(true);
});
