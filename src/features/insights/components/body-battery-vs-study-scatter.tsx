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

export function BodyBatteryVsStudyScatter() {
  const { data } = useInsightsCorrelations();

  const points = data.days.flatMap((day) =>
    day.bodyBattery === undefined
      ? []
      : [{ bodyBattery: day.bodyBattery, studyMinutes: day.studyMinutes }],
  );
  const definition = defineChart({
    marks: [dot(points, { fill: CHART_COLORS.good, r: 4, x: "bodyBattery", y: "studyMinutes" })],
    x: { axis: { label: "Body Battery" }, scale: scaleLinear },
    y: { axis: { label: "学習分数(分)" }, grid: true, nice: true, scale: scaleLinear },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <CorrelationChartHeader correlation={data.bbVsStudy} label="Body Battery × 当日学習分数" />
      <TanStackChart
        ariaDescription="Body Battery と当日学習分数の相関。点を選択すると値を確認できます。"
        ariaLabel="Body Battery と当日学習分数の散布図"
        definition={definition}
        height={CHART_HEIGHT}
      />
    </Box>
  );
}

export function BodyBatteryVsStudyScatterFallback() {
  return (
    <Shimmer loading>
      <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
    </Shimmer>
  );
}
