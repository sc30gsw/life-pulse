import { ScatterChart } from "@mantine/charts";
import { Box } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { filter, map, pipe } from "remeda";

import { CorrelationChartHeader } from "~/features/insights/components/correlation-chart-header";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { ACCENT_VARS } from "~/types/dashboard";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
const CHART_HEIGHT = 220;

export function BodyBatteryVsStudyScatter() {
  const { data } = useInsightsCorrelations();

  const points = pipe(
    data.days,
    filter((day) => day.bodyBattery !== undefined),
    map((day) => ({ bodyBattery: day.bodyBattery as number, studyMinutes: day.studyMinutes })),
  );

  return (
    <Box>
      <CorrelationChartHeader correlation={data.bbVsStudy} label="Body Battery × 当日学習分数" />
      <ScatterChart
        data={[{ color: ACCENT_VARS.good, data: points, name: "Body Battery × 学習分数" }]}
        dataKey={{ x: "bodyBattery", y: "studyMinutes" }}
        gridColor={CHART_GRID_COLOR}
        h={CHART_HEIGHT}
        labels={{ x: "Body Battery", y: "学習分数(分)" }}
        textColor={CHART_TEXT_COLOR}
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
