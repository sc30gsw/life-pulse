import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartBar } from "@tabler/icons-react";
import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";

import { CHART_COLORS, CHART_THEME } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";

const CHART_HEIGHT = 200;

export function HiitBodyBatteryBarChart() {
  const { data } = useInsightsCorrelations();
  const { withHiit, withoutHiit } = data.hiitNextDayBb;

  if (withHiit.avg === null && withoutHiit.avg === null) {
    return (
      <EmptyState
        description="範囲内にBody Batteryの記録がありません"
        icon={<IconChartBar size={48} />}
        title={
          <Text c="blue" fw={600} size="lg">
            比較できるデータがありません
          </Text>
        }
      />
    );
  }

  const chartData = [
    { avg: withHiit.avg ?? 0, group: `前日HIITあり(n=${withHiit.n})` },
    { avg: withoutHiit.avg ?? 0, group: `前日HIITなし(n=${withoutHiit.n})` },
  ];
  const definition = defineChart({
    marks: [barY(chartData, { fill: CHART_COLORS.amber, x: "group", y: "avg" })],
    x: { scale: () => scaleBand<string>().padding(0.22) },
    y: { grid: true, nice: true, scale: scaleLinear },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        前日HIIT有無別・当日Body Battery平均
      </Text>
      <TanStackChart
        ariaDescription="前日に HIIT があった日となかった日の、翌日 Body Battery 平均値。カテゴリ名に標本数を表示しています。"
        ariaLabel="前日 HIIT 有無別の翌日 Body Battery 平均"
        definition={definition}
        height={CHART_HEIGHT}
      />
    </Box>
  );
}

export function HiitBodyBatteryBarChartFallback() {
  return (
    <Shimmer loading>
      <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
    </Shimmer>
  );
}
