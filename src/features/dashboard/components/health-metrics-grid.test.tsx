// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { HealthMetricsGrid } from "~/features/dashboard/components/health-metrics-grid";
import { renderWithMantine } from "~/test-utils";

function buildMetrics(overrides: Partial<Doc<"healthMetrics">> = {}): Doc<"healthMetrics"> {
  return {
    _creationTime: 0,
    _id: "metrics_1",
    dateJst: "2026-07-07",
    source: "garmin",
    syncedAt: 0,
    ...overrides,
  } as unknown as Doc<"healthMetrics">;
}

test("renders 未計測 when metrics is null", () => {
  const { getByText } = renderWithMantine(<HealthMetricsGrid metrics={null} />);

  expect(getByText("未計測")).toBeDefined();
});

test("renders the source label and full metric values", () => {
  const metrics = buildMetrics({
    bodyBattery: 72,
    hrv: 45,
    restingHr: 58,
    sleepMinutes: 420,
    sleepScore: 88,
    source: "garmin",
    steps: 8_432,
  });
  const { getByText } = renderWithMantine(<HealthMetricsGrid metrics={metrics} />);

  expect(getByText("source: garmin")).toBeDefined();
  expect(getByText("72")).toBeDefined();
  expect(getByText("88")).toBeDefined();
  expect(getByText("7.0h")).toBeDefined();
  expect(getByText("58")).toBeDefined();
  expect(getByText("8,432")).toBeDefined();
});

test("falls back to defaults/dashes when optional metrics are undefined", () => {
  const metrics = buildMetrics({ source: "manual" });
  const { getByText, getAllByText } = renderWithMantine(<HealthMetricsGrid metrics={metrics} />);

  expect(getByText("source: manual")).toBeDefined();
  // sleepHoursLabel, hrv, and restingHr each fall back to "—" independently.
  expect(getAllByText("—")).toHaveLength(3);
  // bodyBattery, sleepScore, and steps all default to 0.
  expect(getAllByText("0")).toHaveLength(3);
});
