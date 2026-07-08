// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import {
  HealthMetricsGrid,
  HealthMetricsGridFallback,
} from "~/features/dashboard/components/health-metrics-grid";
import { renderWithMantine } from "~/test-utils";

let metrics: Doc<"healthMetrics"> | null = null;

vi.mock("~/features/dashboard/hooks/use-dashboard-health", () => ({
  useDashboardHealth: () => ({ dateJst: "2026-07-08", lastSyncRelativeLabel: "5分前", metrics }),
}));

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
  metrics = null;

  const { getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("未計測")).toBeDefined();
  expect(getByText("2026/07/08")).toBeDefined();
});

test("renders the source label and full metric values", () => {
  metrics = buildMetrics({
    bodyBattery: 72,
    hrv: 45,
    restingHr: 58,
    sleepMinutes: 420,
    sleepScore: 88,
    source: "garmin",
    steps: 8_432,
  });

  const { getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("source: garmin · 2026/07/07")).toBeDefined();
  expect(getByText("72")).toBeDefined();
  expect(getByText("88")).toBeDefined();
  expect(getByText("7.0h")).toBeDefined();
  expect(getByText("58")).toBeDefined();
  expect(getByText("8,432")).toBeDefined();
});

test("falls back to defaults and dashes when optional metrics are missing", () => {
  metrics = buildMetrics({ source: "manual" });

  const { getAllByText, getByText } = renderWithMantine(<HealthMetricsGrid />);

  expect(getByText("source: manual · 2026/07/07")).toBeDefined();
  expect(getAllByText("—")).toHaveLength(3);
  expect(getAllByText("0")).toHaveLength(3);
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<HealthMetricsGridFallback />);

  expect(getByText("健康メトリクス · Garmin")).toBeDefined();
  expect(getByText("source: garmin")).toBeDefined();
});
