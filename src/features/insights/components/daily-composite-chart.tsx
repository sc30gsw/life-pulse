import { Box, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { barY, defineChart, lineY } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 260;

export function DailyCompositeChart() {
  const { data } = useInsightsCorrelations();

  const chartData = data.days.map((day) => ({
    bodyBattery: day.bodyBattery,
    date: dayjs(day.dateJst).format("M/D"),
    sleepScore: day.sleepScore,
    studyMinutes: day.studyMinutes,
  }));
  const studyRows = chartData.map((row) => ({
    date: row.date,
    series: "学習分数",
    value: row.studyMinutes,
  }));
  const sleepRows = chartData.map((row) => ({
    date: row.date,
    series: "睡眠スコア",
    value: row.sleepScore,
  }));
  const bodyBatteryRows = chartData.map((row) => ({
    date: row.date,
    series: "Body Battery",
    value: row.bodyBattery,
  }));
  const definition = defineChart({
    marks: [
      barY(studyRows, { color: "series", x: "date", y: "value" }),
      lineY(sleepRows, { color: "series", points: true, x: "date", y: "value" }),
      lineY(bodyBatteryRows, { color: "series", points: true, x: "date", y: "value" }),
    ],
    x: { scale: () => scaleBand<string>().padding(0.16) },
    y: { grid: true, nice: true, scale: scaleLinear },
    color: {
      legend: chartLegend,
      scale: () =>
        scaleOrdinal<string, string>()
          .domain(["学習分数", "睡眠スコア", "Body Battery"])
          .range([CHART_COLORS.blue, CHART_COLORS.violet, CHART_COLORS.good]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        学習分数 × 睡眠スコア / Body Battery(直近28日)
      </Text>
      <TanStackChart
        ariaDescription="日ごとの学習分数、睡眠スコア、Body Battery。健康値がない日は線を接続しません。"
        ariaLabel="学習分数と健康指標の複合チャート"
        definition={definition}
        height={CHART_HEIGHT}
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
