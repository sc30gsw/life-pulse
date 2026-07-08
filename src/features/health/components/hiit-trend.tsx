import { BarChart } from "@mantine/charts";
import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartBar } from "@tabler/icons-react";

import { CHART_LEGEND_CLASS_NAMES } from "~/components/chart-legend-style";
import { useWorkouts } from "~/features/health/hooks/use-workouts";
import { HIIT_TREND_DAYS, bucketDailyDuration } from "~/features/health/utils/hiit-trend";
import { ACCENT_VARS } from "~/types/dashboard";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
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

  return (
    <Box mb="md">
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        直近{HIIT_TREND_DAYS}日間のトレーニング時間(分)
      </Text>
      <BarChart
        classNames={CHART_LEGEND_CLASS_NAMES}
        data={chartData}
        dataKey="date"
        gridColor={CHART_GRID_COLOR}
        h={CHART_HEIGHT}
        series={[
          { color: ACCENT_VARS.coral, label: "HIIT", name: "hiit" },
          { color: ACCENT_VARS.blue, label: "ウォーキング", name: "walk" },
          { color: ACCENT_VARS.faint, label: "その他", name: "other" },
        ]}
        textColor={CHART_TEXT_COLOR}
        type="stacked"
        withLegend
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
