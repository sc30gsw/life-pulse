import { Box, EmptyState, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartLine } from "@tabler/icons-react";
import { barY, defineChart, lineY } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useHealthRange } from "~/features/health/hooks/use-health-range";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 220;
const STEPS_CHART_HEIGHT = 160;

function ChartTitle({ label }: Record<"label", string>) {
  return (
    <Text c="dimmed" fw={600} mb="xs" size="xs">
      {label}
    </Text>
  );
}

export function MetricsTrend() {
  const { data: rows } = useHealthRange();

  const chartData = rows.map((row) => ({
    bodyBattery: row.bodyBattery,
    date: dayjs(row.dateJst).format("M/D"),
    hrv: row.hrv,
    restingHr: row.restingHr,
    sleepScore: row.sleepScore,
    steps: row.steps,
  }));

  const sleepRows = chartData.flatMap((row) => [
    { date: row.date, series: "睡眠スコア", value: row.sleepScore },
    { date: row.date, series: "Body Battery", value: row.bodyBattery },
  ]);
  const cardiacRows = chartData.flatMap((row) => [
    { date: row.date, series: "HRV", value: row.hrv },
    { date: row.date, series: "安静時心拍", value: row.restingHr },
  ]);

  const sleepDefinition = defineChart({
    marks: [lineY(sleepRows, { points: true, x: "date", y: "value", z: "series" })],
    x: { scale: () => scaleBand<string>().padding(0.18) },
    y: { grid: true, nice: true, scale: scaleLinear },
    color: {
      legend: chartLegend,
      scale: () =>
        scaleOrdinal<string, string>()
          .domain(["睡眠スコア", "Body Battery"])
          .range([CHART_COLORS.violet, CHART_COLORS.good]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  const cardiacDefinition = defineChart({
    marks: [lineY(cardiacRows, { points: true, x: "date", y: "value", z: "series" })],
    x: { scale: () => scaleBand<string>().padding(0.18) },
    y: { grid: true, nice: true, scale: scaleLinear },
    color: {
      legend: chartLegend,
      scale: () =>
        scaleOrdinal<string, string>()
          .domain(["HRV", "安静時心拍"])
          .range([CHART_COLORS.blue, CHART_COLORS.amber]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  const stepsDefinition = defineChart({
    marks: [barY(chartData, { fill: CHART_COLORS.good, x: "date", y: "steps" })],
    x: { scale: () => scaleBand<string>().padding(0.18) },
    y: { grid: true, nice: true, scale: scaleLinear },
    theme: CHART_THEME,
    tooltip,
  });

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Garmin同期または手動入力を行うと表示されます"
        icon={<IconChartLine size={48} />}
        title={
          <Text c="blue" fw={600} size="xl">
            健康メトリクスの記録はまだありません
          </Text>
        }
      />
    );
  }

  return (
    <Stack gap="lg">
      <Box>
        <ChartTitle label="睡眠スコア / Body Battery" />
        <TanStackChart
          ariaDescription="日ごとの睡眠スコアと Body Battery。記録がない日は線を接続しません。"
          ariaLabel="睡眠スコアと Body Battery の推移"
          definition={sleepDefinition}
          height={CHART_HEIGHT}
        />
      </Box>

      <Box>
        <ChartTitle label="HRV / 安静時心拍" />
        <TanStackChart
          ariaDescription="日ごとの HRV と安静時心拍。記録がない日は線を接続しません。"
          ariaLabel="HRV と安静時心拍の推移"
          definition={cardiacDefinition}
          height={CHART_HEIGHT}
        />
      </Box>

      <Box>
        <ChartTitle label="歩数" />
        <TanStackChart
          ariaDescription="日ごとの歩数"
          ariaLabel="歩数の推移"
          definition={stepsDefinition}
          height={STEPS_CHART_HEIGHT}
        />
      </Box>
    </Stack>
  );
}

export function MetricsTrendFallback() {
  return (
    <Shimmer loading>
      <Stack gap="lg">
        <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
        <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
        <Box
          className="bg-panel-2 border-bd rounded-lg border"
          style={{ height: STEPS_CHART_HEIGHT }}
        />
      </Stack>
    </Shimmer>
  );
}
