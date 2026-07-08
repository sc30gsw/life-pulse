import { BarChart, LineChart } from "@mantine/charts";
import { Box, EmptyState, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartLine } from "@tabler/icons-react";

import { CHART_LEGEND_CLASS_NAMES } from "~/components/chart-legend-style";
import { useHealthRange } from "~/features/health/hooks/use-health-range";
import { ACCENT_VARS } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
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

  if (rows.length === 0) {
    return (
      <EmptyState
        description="手動入力するかデモモードを有効にすると表示されます"
        icon={<IconChartLine size={48} />}
        title={
          <Text c="blue" fw={600} size="xl">
            健康メトリクスの記録はまだありません
          </Text>
        }
      />
    );
  }

  const chartData = rows.map((row) => ({
    bodyBattery: row.bodyBattery,
    date: dayjs(row.dateJst).format("M/D"),
    hrv: row.hrv,
    restingHr: row.restingHr,
    sleepScore: row.sleepScore,
    steps: row.steps,
  }));

  return (
    <Stack gap="lg">
      <Box>
        <ChartTitle label="睡眠スコア / Body Battery" />
        <LineChart
          classNames={CHART_LEGEND_CLASS_NAMES}
          connectNulls={false}
          curveType="monotone"
          data={chartData}
          dataKey="date"
          gridColor={CHART_GRID_COLOR}
          h={CHART_HEIGHT}
          series={[
            { color: ACCENT_VARS.violet, label: "睡眠スコア", name: "sleepScore" },
            { color: ACCENT_VARS.good, label: "Body Battery", name: "bodyBattery" },
          ]}
          textColor={CHART_TEXT_COLOR}
          withLegend
        />
      </Box>

      <Box>
        <ChartTitle label="HRV / 安静時心拍" />
        <LineChart
          classNames={CHART_LEGEND_CLASS_NAMES}
          connectNulls={false}
          curveType="monotone"
          data={chartData}
          dataKey="date"
          gridColor={CHART_GRID_COLOR}
          h={CHART_HEIGHT}
          series={[
            { color: ACCENT_VARS.blue, label: "HRV", name: "hrv" },
            { color: ACCENT_VARS.amber, label: "安静時心拍", name: "restingHr" },
          ]}
          textColor={CHART_TEXT_COLOR}
          withLegend
        />
      </Box>

      <Box>
        <ChartTitle label="歩数" />
        <BarChart
          data={chartData}
          dataKey="date"
          gridColor={CHART_GRID_COLOR}
          h={STEPS_CHART_HEIGHT}
          series={[{ color: ACCENT_VARS.good, name: "steps" }]}
          textColor={CHART_TEXT_COLOR}
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
