import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartPie } from "@tabler/icons-react";
import { defineChart } from "@tanstack/charts";
import { pie, polar, radialArc, radialText } from "@tanstack/charts/polar";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { type WorkoutKind } from "~/types/dashboard";

const CHART_SIZE = 140;

const WORKOUT_KIND_COLORS = {
  hiit: CHART_COLORS.coral,
  other: CHART_COLORS.faint,
  walk: CHART_COLORS.blue,
} as const satisfies Record<WorkoutKind, string>;

function workoutKindLabel(kind: WorkoutKind) {
  switch (kind) {
    case "hiit":
      return "HIIT";

    case "other":
      return "その他";

    case "walk":
      return "ウォーキング";
  }
}

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
    key: row.kind,
    name: workoutKindLabel(row.kind),
    value: row.count,
  }));
  const slices = pie(chartData, { value: "value" });
  const definition = defineChart({
    marks: [
      polar({
        radiusRatio: 0.84,
        marks: [
          radialArc(slices, { color: "key", key: "key", outerRadius: ({ radius }) => radius }),
          radialText(slices, {
            anchor: "middle",
            fontSize: 12,
            radius: 0.62,
            text: "value",
          }),
        ],
      }),
    ],
    color: {
      domain: ["hiit", "walk", "other"],
      legend: chartLegend,
      range: [WORKOUT_KIND_COLORS.hiit, WORKOUT_KIND_COLORS.walk, WORKOUT_KIND_COLORS.other],
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        トレーニング種別内訳(直近28日)
      </Text>
      <TanStackChart
        ariaDescription="HIIT、ウォーキング、その他のトレーニング件数。各扇形の中央に件数を表示しています。"
        ariaLabel="トレーニング種別の件数内訳"
        definition={definition}
        height={CHART_SIZE}
        initialWidth={CHART_SIZE}
        style={{ maxWidth: CHART_SIZE }}
      />
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
