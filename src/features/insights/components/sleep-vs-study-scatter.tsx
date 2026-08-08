import { Box } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { defineChart, dot } from "@tanstack/charts";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { CorrelationChartHeader } from "~/features/insights/components/correlation-chart-header";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";

const CHART_HEIGHT = 220;

export function SleepVsStudyScatter() {
  const { data } = useInsightsCorrelations();

  const points = data.days.flatMap((day) =>
    day.sleepScore === undefined
      ? []
      : [{ sleepScore: day.sleepScore, studyMinutes: day.studyMinutes }],
  );
  const definition = defineChart({
    marks: [dot(points, { fill: CHART_COLORS.violet, r: 4, x: "sleepScore", y: "studyMinutes" })],
    x: { axis: { label: "睡眠スコア" }, scale: scaleLinear },
    y: { axis: { label: "学習分数(分)" }, grid: true, nice: true, scale: scaleLinear },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <CorrelationChartHeader correlation={data.sleepVsStudy} label="睡眠スコア × 当日学習分数" />
      <TanStackChart
        ariaDescription="睡眠スコアと当日学習分数の相関。点を選択すると値を確認できます。"
        ariaLabel="睡眠スコアと当日学習分数の散布図"
        definition={definition}
        height={CHART_HEIGHT}
      />
    </Box>
  );
}

export function SleepVsStudyScatterFallback() {
  return (
    <Shimmer loading>
      <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
    </Shimmer>
  );
}
