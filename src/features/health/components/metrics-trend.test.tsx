// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import { MetricsTrend, MetricsTrendFallback } from "~/features/health/components/metrics-trend";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  rows: [] as Array<Record<string, number | string | undefined>>,
}));

vi.mock("~/features/health/hooks/use-health-range", () => ({
  useHealthRange: () => ({ data: hookState.rows }),
}));

vi.mock("~/components/charts/tanstack-chart", () => ({
  TanStackChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-label={ariaLabel} data-testid="tanstack-chart" />
  ),
}));

vi.mock("@shimmer-from-structure/react", () => ({
  Shimmer: ({ children }: { children: ReactNode }) => <div data-testid="shimmer">{children}</div>,
}));

test("shows an empty state when no health rows exist", () => {
  hookState.rows = [];

  const { getByText } = renderWithMantine(<MetricsTrend />);

  expect(getByText("健康メトリクスの記録はまだありません")).toBeDefined();
  expect(getByText("Garmin同期または手動入力を行うと表示されます")).toBeDefined();
});

test("renders line and bar charts with mapped health rows", () => {
  hookState.rows = [
    {
      bodyBattery: 65,
      dateJst: "2026-07-08",
      hrv: 42,
      restingHr: 58,
      sleepScore: 88,
      steps: 12_345,
    },
  ];

  const { getAllByTestId, getByText } = renderWithMantine(<MetricsTrend />);
  const charts = getAllByTestId("tanstack-chart");

  expect(getByText("睡眠スコア / Body Battery")).toBeDefined();
  expect(getByText("HRV / 安静時心拍")).toBeDefined();
  expect(getByText("歩数")).toBeDefined();
  expect(charts).toHaveLength(3);
  expect(charts[0]?.getAttribute("data-label")).toBe("睡眠スコアと Body Battery の推移");
  expect(charts[1]?.getAttribute("data-label")).toBe("HRV と安静時心拍の推移");
  expect(charts[2]?.getAttribute("data-label")).toBe("歩数の推移");
});

test("renders chart fallback placeholders", () => {
  const { getByTestId } = renderWithMantine(<MetricsTrendFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
