import { BarChart } from "@mantine/charts";
import { Box, EmptyState, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChartBar } from "@tabler/icons-react";

import { useInsightsCorrelations } from "~/features/insights/hooks/use-insights-correlations";
import { ACCENT_VARS } from "~/types/dashboard";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";
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

  return (
    <Box>
      <Text c="dimmed" fw={600} mb="xs" size="xs">
        前日HIIT有無別・当日Body Battery平均
      </Text>
      <BarChart
        data={chartData}
        dataKey="group"
        gridColor={CHART_GRID_COLOR}
        h={CHART_HEIGHT}
        series={[{ color: ACCENT_VARS.amber, name: "avg" }]}
        textColor={CHART_TEXT_COLOR}
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
