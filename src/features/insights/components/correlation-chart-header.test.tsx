// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { CorrelationChartHeader } from "~/features/insights/components/correlation-chart-header";
import type { InsightsCorrelation } from "~/features/insights/types/insights";
import { renderWithMantine } from "~/test-utils";

function buildCorrelation(
  correlation: Pick<InsightsCorrelation, "n" | "r">,
): InsightsCorrelation {
  return correlation as InsightsCorrelation;
}

test("shows the chart label and formatted correlation when data is sufficient", () => {
  const { getByText } = renderWithMantine(
    <CorrelationChartHeader
      correlation={buildCorrelation({ n: 14, r: 0.4231 })}
      label="睡眠時間 vs 学習時間"
    />,
  );

  expect(getByText("睡眠時間 vs 学習時間")).toBeDefined();
  expect(getByText("r=0.42(n=14)")).toBeDefined();
});

test("shows the insufficient-data badge text when correlation cannot be computed", () => {
  const { getByText } = renderWithMantine(
    <CorrelationChartHeader
      correlation={buildCorrelation({ n: 5, r: null })}
      label="Body Battery vs 学習時間"
    />,
  );

  expect(getByText("Body Battery vs 学習時間")).toBeDefined();
  expect(getByText("データ不足(n=5)")).toBeDefined();
});
