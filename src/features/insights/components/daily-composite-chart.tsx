import { CompositeChart } from "@mantine/charts";
import { Box, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

import { CHART_LEGEND_CLASS_NAMES } from "~/components/chart-legend-style";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { ACCENT_VARS } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
const CHART_HEIGHT = 260;

export function DailyCompositeChart() {
  const { data } = useInsightsCorrelations();

  const chartData = data.days.map((day) => ({
    bodyBattery: day.bodyBattery,
    date: dayjs(day.dateJst).format("M/D"),
    sleepScore: day.sleepScore,
    studyMinutes: day.studyMinutes,
  }));

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        学習分数 × 睡眠スコア / Body Battery(直近28日)
      </Text>
      <CompositeChart
        classNames={CHART_LEGEND_CLASS_NAMES}
        connectNulls={false}
        data={chartData}
        dataKey="date"
        gridColor={CHART_GRID_COLOR}
        h={CHART_HEIGHT}
        series={[
          { color: ACCENT_VARS.blue, label: "学習分数", name: "studyMinutes", type: "bar" },
          { color: ACCENT_VARS.violet, label: "睡眠スコア", name: "sleepScore", type: "line" },
          { color: ACCENT_VARS.good, label: "Body Battery", name: "bodyBattery", type: "line" },
        ]}
        textColor={CHART_TEXT_COLOR}
        withLegend
      />
    </Box>
  );
}

export function DailyCompositeChartFallback() {
  return (
    <Shimmer loading>
      <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
    </Shimmer>
  );
}
