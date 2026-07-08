import { expect, test } from "vite-plus/test";

import { DEMO_METRIC_RANGES, DEMO_STEPS_RANGE } from "../../lib/demoConstants";
import { type DemoMetricFields, nextDemoMetric } from "./nextDemoMetric";

function alwaysReturns(value: number) {
  return () => value;
}

function cyclicRand(sequence: number[]) {
  let index = 0;

  return () => sequence[index++ % sequence.length];
}

test("stays within clamp bounds across many ticks with an adversarial rand that always returns 1", () => {
  let metrics = nextDemoMetric(undefined, alwaysReturns(1));

  for (let tick = 0; tick < 200; tick += 1) {
    metrics = nextDemoMetric(metrics, alwaysReturns(1));

    expect(metrics.sleepScore).toBeLessThanOrEqual(DEMO_METRIC_RANGES.sleepScore.max);
    expect(metrics.sleepMinutes).toBeLessThanOrEqual(DEMO_METRIC_RANGES.sleepMinutes.max);
    expect(metrics.bodyBattery).toBeLessThanOrEqual(DEMO_METRIC_RANGES.bodyBattery.max);
    expect(metrics.hrv).toBeLessThanOrEqual(DEMO_METRIC_RANGES.hrv.max);
    expect(metrics.restingHr).toBeLessThanOrEqual(DEMO_METRIC_RANGES.restingHr.max);
    expect(metrics.steps).toBeLessThanOrEqual(DEMO_STEPS_RANGE.max);
  }
});

test("stays within clamp bounds across many ticks with an adversarial rand that always returns 0", () => {
  let metrics = nextDemoMetric(undefined, alwaysReturns(0));

  for (let tick = 0; tick < 200; tick += 1) {
    metrics = nextDemoMetric(metrics, alwaysReturns(0));

    expect(metrics.sleepScore).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.sleepScore.min);
    expect(metrics.sleepMinutes).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.sleepMinutes.min);
    expect(metrics.bodyBattery).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.bodyBattery.min);
    expect(metrics.hrv).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.hrv.min);
    expect(metrics.restingHr).toBeGreaterThanOrEqual(DEMO_METRIC_RANGES.restingHr.min);
    // steps' delta is strictly positive, so an all-zero rand still climbs
    // toward the max instead of sitting at the min — assert the invariant
    // that actually matters here: it never drops below DEMO_STEPS_RANGE.min.
    expect(metrics.steps).toBeGreaterThanOrEqual(DEMO_STEPS_RANGE.min);
    expect(metrics.steps).toBeLessThanOrEqual(DEMO_STEPS_RANGE.max);
  }
});

test("steps never decreases tick-over-tick, even with mixed random values", () => {
  const rand = cyclicRand([0, 0.2, 0.9, 0.5, 1, 0.1, 0.75, 0.33]);

  let metrics = nextDemoMetric(undefined, rand);

  for (let tick = 0; tick < 50; tick += 1) {
    const next = nextDemoMetric(metrics, rand);

    expect(next.steps).toBeGreaterThanOrEqual(metrics.steps);
    metrics = next;
  }
});

test("same prev + same injected rand sequence produce the same deterministic output", () => {
  const prev: Required<DemoMetricFields> = {
    bodyBattery: 60,
    hrv: 50,
    restingHr: 55,
    sleepMinutes: 420,
    sleepScore: 75,
    steps: 8000,
  };
  const sequence = [0.1, 0.9, 0.4, 0.6, 0.2, 0.8];

  expect(nextDemoMetric(prev, cyclicRand(sequence))).toEqual(
    nextDemoMetric(prev, cyclicRand(sequence)),
  );
});

test("first tick (no prior value) starts from a mid-range value before applying the delta", () => {
  // rand=0.5 maps to a zero delta for the symmetric fields, isolating the
  // mid-range starting value: mid(min,max) for each field.
  const metrics = nextDemoMetric(undefined, alwaysReturns(0.5));

  expect(metrics.sleepScore).toBe(75); // mid(55, 95)
  expect(metrics.sleepMinutes).toBe(420); // mid(300, 540)
  expect(metrics.bodyBattery).toBe(60); // mid(20, 100)
  expect(metrics.hrv).toBe(60); // mid(30, 90)
  expect(metrics.restingHr).toBe(58); // mid(45, 70) = 57.5, rounded
});

test("steps' first tick starts at its mid-range value, then applies the positive-only delta", () => {
  const metrics = nextDemoMetric(undefined, alwaysReturns(0));

  expect(metrics.steps).toBe(10_100); // mid(2000, 18000) + deltaMin(100)
});

test("a field missing from a partial prev falls back to its own mid-range start", () => {
  const partialPrev: DemoMetricFields = { sleepScore: 80 };

  const metrics = nextDemoMetric(partialPrev, alwaysReturns(0.5));

  expect(metrics.sleepScore).toBe(80); // continues the walk from prev
  expect(metrics.bodyBattery).toBe(60); // no prior value -> mid-range start
});
