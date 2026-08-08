// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import {
  BodyBatteryVsStudyScatter,
  BodyBatteryVsStudyScatterFallback,
} from "~/features/insights/components/body-battery-vs-study-scatter";
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
    <div data-label={ariaLabel} data-testid="scatter-chart" />
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
  hookState.data = buildData({ bbVsStudy: { n: 3, r: 0.9 } });

  const { getByText } = renderWithMantine(<BodyBatteryVsStudyScatter />);

  expect(getByText("データ不足(n=3)")).toBeDefined();
});

test("shows r formatted to 2 decimal places when there is enough data", () => {
  hookState.data = buildData({ bbVsStudy: { n: 15, r: -0.6789 } });

  const { getByText } = renderWithMantine(<BodyBatteryVsStudyScatter />);

  expect(getByText("r=-0.68(n=15)")).toBeDefined();
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<BodyBatteryVsStudyScatterFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
