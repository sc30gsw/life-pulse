import { Box, Group, Text } from "@mantine/core";
import { barY, defineChart, stack } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";
import { useState } from "react";

import { ChartDataTable } from "~/components/charts/chart-data-table";
import { ChartPeriodControl } from "~/components/charts/chart-period-control";
import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { type AnalyticsPeriodDays } from "~/features/insights/utils/analytics-range";
import { useStudyAnalytics } from "~/features/study/hooks/use-study-analytics";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 240;

type DefenseRow = {
  date: string;
  defendedMinutes: number;
  defenseRate: number | null;
  plannedMinutes: number;
};

export function StudyDefenseChart() {
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(28);
  const { data } = useStudyAnalytics(periodDays);
  const rows = data.days.map((day) => ({
    date: dayjs(day.dateJst).format("M/D"),
    defendedMinutes: day.defendedMinutes,
    defenseRate: day.defenseRate,
    plannedMinutes: day.plannedMinutes,
  }));
  const chartRows = rows.flatMap((row) => [
    { date: row.date, series: "防衛", value: row.defendedMinutes },
    {
      date: row.date,
      series: "未防衛",
      value: Math.max(0, row.plannedMinutes - row.defendedMinutes),
    },
  ]);
  const definition = defineChart({
    marks: [
      barY(chartRows, {
        color: "series",
        layout: stack({ order: ["防衛", "未防衛"] }),
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
          .domain(["防衛", "未防衛"])
          .range([CHART_COLORS.good, CHART_COLORS.faint]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text c="dimmed" fw={600} size="xs">
          学習枠の防衛率・侵食(直近{periodDays}日)
        </Text>
        <ChartPeriodControl onChange={setPeriodDays} value={periodDays} />
      </Group>
      <TanStackChart
        ariaDescription="完了した学習枠と未完了の学習枠を日別に積み上げています。"
        ariaLabel="学習枠の防衛率"
        definition={definition}
        height={CHART_HEIGHT}
      />
      <details className="mt-3">
        <summary className="cursor-pointer text-sm">日別データ表</summary>
        <ChartDataTable
          caption="学習枠の防衛率 日別データ"
          columns={[
            { key: "date", label: "日付", render: (row: DefenseRow) => row.date },
            {
              key: "planned",
              label: "予定(分)",
              render: (row: DefenseRow) => row.plannedMinutes,
            },
            {
              key: "defended",
              label: "防衛(分)",
              render: (row: DefenseRow) => row.defendedMinutes,
            },
            {
              key: "rate",
              label: "防衛率",
              render: (row: DefenseRow) =>
                row.defenseRate === null ? "データなし" : `${Math.round(row.defenseRate * 100)}%`,
            },
          ]}
          rows={rows}
        />
      </details>
    </Box>
  );
}

export function StudyDefenseChartFallback() {
  return (
    <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
  );
}
