// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import {
  DailyCompositeChart,
  DailyCompositeChartFallback,
} from "~/features/insights/components/daily-composite-chart";
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
    <div data-label={ariaLabel} data-testid="composite-chart" />
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

test("renders one chart row per day and a bar+line series mix", () => {
  hookState.data = buildData({
    days: [
      {
        bodyBattery: 60,
        dateJst: "2026-07-01",
        hiitPrevDay: false,
        sleepScore: 70,
        studyMinutes: 30,
      },
      { dateJst: "2026-07-02", hiitPrevDay: true, studyMinutes: 0 },
    ],
  });

  const { getByTestId } = renderWithMantine(<DailyCompositeChart />);
  const chart = getByTestId("composite-chart");

  expect(chart.getAttribute("data-label")).toBe("学習分数と健康指標の複合チャート");
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<DailyCompositeChartFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
