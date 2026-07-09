// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import {
  SleepVsStudyScatter,
  SleepVsStudyScatterFallback,
} from "~/features/insights/components/sleep-vs-study-scatter";
import type { InsightsCorrelations } from "~/features/insights/types/insights";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  data: null as unknown as InsightsCorrelations,
}));

vi.mock("~/features/insights/hooks/use-insights-correlations", () => ({
  useInsightsCorrelations: () => ({ data: hookState.data }),
}));

vi.mock("@mantine/charts", () => ({
  ScatterChart: ({ data }: { data: Array<{ data: unknown[] }> }) => (
    <div data-points={data[0]?.data.length ?? 0} data-testid="scatter-chart" />
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

test("shows データ不足 when n is below MIN_CORRELATION_N", () => {
  hookState.data = buildData({ sleepVsStudy: { n: 5, r: 0.8 } });

  const { getByText } = renderWithMantine(<SleepVsStudyScatter />);

  expect(getByText("データ不足(n=5)")).toBeDefined();
});

test("shows r formatted to 2 decimal places when there is enough data", () => {
  hookState.data = buildData({ sleepVsStudy: { n: 23, r: 0.4231 } });

  const { getByText } = renderWithMantine(<SleepVsStudyScatter />);

  expect(getByText("r=0.42(n=23)")).toBeDefined();
});

test("only passes days with a defined sleepScore as scatter points", () => {
  hookState.data = buildData({
    days: [
      { dateJst: "2026-07-01", hiitPrevDay: false, sleepScore: 80, studyMinutes: 30 },
      { dateJst: "2026-07-02", hiitPrevDay: false, studyMinutes: 10 },
    ],
    sleepVsStudy: { n: 1, r: null },
  });

  const { getByTestId } = renderWithMantine(<SleepVsStudyScatter />);

  expect(getByTestId("scatter-chart").getAttribute("data-points")).toBe("1");
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<SleepVsStudyScatterFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
