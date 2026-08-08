// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import {
  HiitBodyBatteryBarChart,
  HiitBodyBatteryBarChartFallback,
} from "~/features/insights/components/hiit-body-battery-bar-chart";
import type { InsightsCorrelations } from "~/features/insights/types/insights";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  data: null as unknown as InsightsCorrelations,
}));

vi.mock("~/features/insights/hooks/use-insights-correlations", () => ({
  useInsightsCorrelations: () => ({ data: hookState.data }),
}));

vi.mock("~/components/charts/tanstack-chart", () => ({
  TanStackChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-label={ariaLabel} data-testid="bar-chart" />
  ),
}));

vi.mock("@shimmer-from-structure/react", () => ({
  Shimmer: ({ children }: { children: ReactNode }) => <div data-testid="shimmer">{children}</div>,
}));

function buildData(overrides: Partial<InsightsCorrelations> = {}): InsightsCorrelations {
  return {
    bbVsStudy: { n: 0, r: null },
    days: [],
    hiitNextDayBb: {
      withHiit: { avg: null, n: 0 },
      withoutHiit: { avg: null, n: 0 },
    },
    sleepVsStudy: { n: 0, r: null },
    workoutKindBreakdown: [],
    ...overrides,
  };
}

test("shows an empty state when both groups have no Body Battery data", () => {
  hookState.data = buildData();

  const { getByText } = renderWithMantine(<HiitBodyBatteryBarChart />);

  expect(getByText("比較できるデータがありません")).toBeDefined();
});

test("renders a 2-group bar chart with n annotated per group", () => {
  hookState.data = buildData({
    hiitNextDayBb: {
      withHiit: { avg: 72.5, n: 4 },
      withoutHiit: { avg: 58.2, n: 20 },
    },
  });

  const { getByTestId } = renderWithMantine(<HiitBodyBatteryBarChart />);
  const chart = getByTestId("bar-chart");

  expect(chart.getAttribute("data-label")).toBe("前日 HIIT 有無別の翌日 Body Battery 平均");
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<HiitBodyBatteryBarChartFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
