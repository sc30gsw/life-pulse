import { PieChart } from "@mantine/charts";
import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartPie } from "@tabler/icons-react";

import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { ACCENT_VARS, type WorkoutKind, WORKOUT_KIND_LABELS } from "~/types/dashboard";

const CHART_SIZE = 140;

const WORKOUT_KIND_COLORS = {
  hiit: ACCENT_VARS.coral,
  other: ACCENT_VARS.faint,
  walk: ACCENT_VARS.blue,
} as const satisfies Record<WorkoutKind, string>;

export function WorkoutKindPieChart() {
  const { data } = useInsightsCorrelations();

  if (data.workoutKindBreakdown.length === 0) {
    return (
      <EmptyState
        description="範囲内にトレーニングの記録がありません"
        icon={<IconChartPie size={48} />}
        title={
          <Text c="blue" fw={600} size="lg">
            記録はまだありません
          </Text>
        }
      />
    );
  }

  const chartData = data.workoutKindBreakdown.map((row) => ({
    color: WORKOUT_KIND_COLORS[row.kind],
    key: row.kind,
    name: WORKOUT_KIND_LABELS[row.kind],
    value: row.count,
  }));

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        トレーニング種別内訳(直近28日)
      </Text>
      <PieChart data={chartData} size={CHART_SIZE} withLabels withLegend />
    </Box>
  );
}

export function WorkoutKindPieChartFallback() {
  return (
    <Shimmer loading>
      <Box
        className="bg-panel-2 border-bd rounded-full border"
        style={{ height: CHART_SIZE, width: CHART_SIZE }}
      />
    </Shimmer>
  );
}
