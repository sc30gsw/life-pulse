import type { Doc } from "../../_generated/dataModel";
import { DEMO_METRIC_RANGES, DEMO_STEPS_RANGE } from "../../lib/demoConstants";

export type DemoMetricFields = Pick<
  Doc<"healthMetrics">,
  "bodyBattery" | "hrv" | "restingHr" | "sleepMinutes" | "sleepScore" | "steps"
>;

// Advances one demo random-walk tick (NFR-5: called every DEMO_TICK_MS).
// Pure function (CVX-09) — `rand` is injected (shaped like Math.random) so
// callers control the exact sequence; this function never reads
// Math.random()/Date.now() itself, keeping it deterministic for tests.
export function nextDemoMetric(
  prev: DemoMetricFields | undefined,
  rand: () => number,
): Required<DemoMetricFields> {
  return {
    bodyBattery: nextBoundedValue(prev?.bodyBattery, DEMO_METRIC_RANGES.bodyBattery, rand()),
    hrv: nextBoundedValue(prev?.hrv, DEMO_METRIC_RANGES.hrv, rand()),
    restingHr: nextBoundedValue(prev?.restingHr, DEMO_METRIC_RANGES.restingHr, rand()),
    sleepMinutes: nextBoundedValue(prev?.sleepMinutes, DEMO_METRIC_RANGES.sleepMinutes, rand()),
    sleepScore: nextBoundedValue(prev?.sleepScore, DEMO_METRIC_RANGES.sleepScore, rand()),
    steps: nextSteps(prev?.steps, rand()),
  };
}

function nextBoundedValue(
  prev: number | undefined,
  range: Record<"min" | "max" | "delta", number>,
  randValue: number,
) {
  const current = prev ?? Math.round((range.min + range.max) / 2);
  const delta = Math.round((randValue * 2 - 1) * range.delta);

  return clamp(current + delta, range.min, range.max);
}

// steps' delta is always drawn from a strictly positive range (deltaMin > 0),
// so current + delta > current on every tick — clamping can only hold it at
// DEMO_STEPS_RANGE.max, never send it below its previous value.
function nextSteps(prev: number | undefined, randValue: number) {
  const current = prev ?? Math.round((DEMO_STEPS_RANGE.min + DEMO_STEPS_RANGE.max) / 2);
  const delta = Math.round(
    DEMO_STEPS_RANGE.deltaMin + randValue * (DEMO_STEPS_RANGE.deltaMax - DEMO_STEPS_RANGE.deltaMin),
  );

  return clamp(current + delta, DEMO_STEPS_RANGE.min, DEMO_STEPS_RANGE.max);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
