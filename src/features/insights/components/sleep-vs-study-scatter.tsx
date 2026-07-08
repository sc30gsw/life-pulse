import { ScatterChart } from "@mantine/charts";
import { Box } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

import { CorrelationChartHeader } from "~/features/insights/components/correlation-chart-header";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { ACCENT_VARS } from "~/types/dashboard";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
const CHART_HEIGHT = 220;

export function SleepVsStudyScatter() {
  const { data } = useInsightsCorrelations();

  const points = data.days.flatMap((day) =>
    day.sleepScore === undefined
      ? []
      : [{ sleepScore: day.sleepScore, studyMinutes: day.studyMinutes }],
  );

  return (
    <Box>
      <CorrelationChartHeader correlation={data.sleepVsStudy} label="睡眠スコア × 当日学習分数" />
      <ScatterChart
        data={[{ color: ACCENT_VARS.violet, data: points, name: "睡眠スコア × 学習分数" }]}
        dataKey={{ x: "sleepScore", y: "studyMinutes" }}
        gridColor={CHART_GRID_COLOR}
        h={CHART_HEIGHT}
        labels={{ x: "睡眠スコア", y: "学習分数(分)" }}
        textColor={CHART_TEXT_COLOR}
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
