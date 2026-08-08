import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartBar } from "@tabler/icons-react";
import { barY, defineChart, stack } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useWorkouts } from "~/features/health/hooks/use-workouts";
import { HIIT_TREND_DAYS, bucketDailyDuration } from "~/features/health/utils/hiit-trend";

const CHART_HEIGHT = 160;

export function HiitTrend() {
  const { data: workouts } = useWorkouts();

  if (workouts.length === 0) {
    return (
      <EmptyState
        description={`直近${HIIT_TREND_DAYS}日間のトレーニング記録がありません`}
        icon={<IconChartBar size={48} />}
        title={
          <Text c="blue" fw={600} size="lg">
            トレーニングの記録はまだありません
          </Text>
        }
      />
    );
  }

  const chartData = bucketDailyDuration(workouts);
  const chartRows = chartData.flatMap((row) => [
    { date: row.date, series: "HIIT", value: row.hiit },
    { date: row.date, series: "ウォーキング", value: row.walk },
    { date: row.date, series: "その他", value: row.other },
  ]);
  const definition = defineChart({
    marks: [
      barY(chartRows, {
        color: "series",
        layout: stack({ order: ["HIIT", "ウォーキング", "その他"] }),
        x: "date",
        y: "value",
      }),
    ],
    x: { scale: () => scaleBand<string>().padding(0.16) },
    y: { grid: true, nice: true, scale: scaleLinear },
    color: {
      legend: chartLegend,
      scale: () =>
        scaleOrdinal<string, string>()
          .domain(["HIIT", "ウォーキング", "その他"])
          .range([CHART_COLORS.coral, CHART_COLORS.blue, CHART_COLORS.faint]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box mb="md">
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        直近{HIIT_TREND_DAYS}日間のトレーニング時間(分)
      </Text>
      <TanStackChart
        ariaDescription="日ごとのトレーニング時間を HIIT、ウォーキング、その他に分けた積み上げ棒グラフ。"
        ariaLabel="トレーニング時間の内訳"
        definition={definition}
        height={CHART_HEIGHT}
      />
    </Box>
  );
}

export function HiitTrendFallback() {
  return (
    <Shimmer loading>
      <Box
        className="bg-panel-2 border-bd mb-4 rounded-lg border"
        style={{ height: CHART_HEIGHT }}
      />
    </Shimmer>
  );
}
