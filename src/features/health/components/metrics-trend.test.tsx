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

vi.mock("@mantine/charts", () => ({
  BarChart: ({ data, series }: { data: unknown[]; series: Array<{ name: string }> }) => (
    <div
      data-first-row={JSON.stringify(data[0])}
      data-series={series.map((item) => item.name).join(",")}
      data-testid="bar-chart"
    >
      rows:{data.length}
    </div>
  ),
  LineChart: ({ data, series }: { data: unknown[]; series: Array<{ label: string }> }) => (
    <div
      data-first-row={JSON.stringify(data[0])}
      data-series={series.map((item) => item.label).join(",")}
      data-testid="line-chart"
    >
      rows:{data.length}
    </div>
  ),
}));

vi.mock("@shimmer-from-structure/react", () => ({
  Shimmer: ({ children }: { children: ReactNode }) => <div data-testid="shimmer">{children}</div>,
}));

test("shows an empty state when no health rows exist", () => {
  hookState.rows = [];

  const { getByText } = renderWithMantine(<MetricsTrend />);

  expect(getByText("健康メトリクスの記録はまだありません")).toBeDefined();
  expect(getByText("手動入力するかデモモードを有効にすると表示されます")).toBeDefined();
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

  const { getAllByTestId, getByTestId, getByText } = renderWithMantine(<MetricsTrend />);
  const lineCharts = getAllByTestId("line-chart");

  expect(getByText("睡眠スコア / Body Battery")).toBeDefined();
  expect(getByText("HRV / 安静時心拍")).toBeDefined();
  expect(getByText("歩数")).toBeDefined();
  expect(lineCharts).toHaveLength(2);
  expect(lineCharts[0]?.getAttribute("data-series")).toBe("睡眠スコア,Body Battery");
  expect(lineCharts[1]?.getAttribute("data-series")).toBe("HRV,安静時心拍");
  expect(lineCharts[0]?.getAttribute("data-first-row")).toContain('"date":"7/8"');
  expect(getByTestId("bar-chart").getAttribute("data-series")).toBe("steps");
  expect(getByTestId("bar-chart").getAttribute("data-first-row")).toContain('"steps":12345');
});

test("renders chart fallback placeholders", () => {
  const { getByTestId } = renderWithMantine(<MetricsTrendFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
