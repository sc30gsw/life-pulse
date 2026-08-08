// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import {
  WorkoutKindPieChart,
  WorkoutKindPieChartFallback,
} from "~/features/insights/components/workout-kind-pie-chart";
import type { InsightsCorrelations } from "~/features/insights/types/insights";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  data: null as unknown as InsightsCorrelations,
}));

vi.mock("~/features/insights/hooks/use-insights-correlations", () => ({
  useInsightsCorrelations: () => ({ data: hookState.data }),
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

test("shows an empty state when there is no workout breakdown", () => {
  hookState.data = buildData();

  const { getByText } = renderWithMantine(<WorkoutKindPieChart />);

  expect(getByText("記録はまだありません")).toBeDefined();
});

test("renders workout kind breakdown without a polar scale error", () => {
  hookState.data = buildData({
    workoutKindBreakdown: [
      { count: 5, kind: "hiit" },
      { count: 2, kind: "walk" },
    ],
  });

  const { getByRole } = renderWithMantine(<WorkoutKindPieChart />);

  expect(getByRole("img", { name: "トレーニング種別の件数内訳" })).toBeDefined();
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<WorkoutKindPieChartFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
