import type { Doc } from "../_generated/dataModel";

// NFR-5: the demo tick interval must stay >= 15s.
export const DEMO_TICK_MS = 20_000;

// Seed window: today - DEMO_SEED_DAYS .. today inclusive (DEMO_SEED_DAYS + 1 rows).
export const DEMO_SEED_DAYS = 14;

export type DemoMetricField = keyof Pick<
  Doc<"healthMetrics">,
  "sleepScore" | "sleepMinutes" | "bodyBattery" | "hrv" | "restingHr" | "steps"
>;

type BoundedFieldRange = Record<"min" | "max" | "delta", number>;

// Random-walk clamp ranges + symmetric per-tick delta for every metric field
// except steps, which only ever increases (see DEMO_STEPS_RANGE below).
export const DEMO_METRIC_RANGES = {
  bodyBattery: { min: 20, max: 100, delta: 5 },
  hrv: { min: 30, max: 90, delta: 4 },
  restingHr: { min: 45, max: 70, delta: 2 },
  sleepMinutes: { min: 300, max: 540, delta: 15 },
  sleepScore: { min: 55, max: 95, delta: 3 },
} as const satisfies Record<Exclude<DemoMetricField, "steps">, BoundedFieldRange>;

// steps only ever increases: the per-tick delta is drawn from a strictly
// positive range, never a symmetric one like the fields above.
export const DEMO_STEPS_RANGE = {
  deltaMax: 600,
  deltaMin: 100,
  max: 18000,
  min: 2000,
} as const satisfies Record<string, number>;
