import { Box, Group, Text } from "@mantine/core";
import { crosshair, defineChart, dot, ruleY } from "@tanstack/charts";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { useState } from "react";

import { ChartDataTable } from "~/components/charts/chart-data-table";
import { ChartPeriodControl } from "~/components/charts/chart-period-control";
import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useHealthRange } from "~/features/health/hooks/use-health-range";
import { useWorkouts } from "~/features/health/hooks/use-workouts";
import { type AnalyticsPeriodDays } from "~/features/insights/utils/analytics-range";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 250;

type RecoveryRow = {
  bodyBattery: number;
  date: string;
  durationMinutes: number;
  intensity: number | null;
  kind: "hiit" | "walk" | "other";
};

export function WorkoutRecoveryBubbleChart() {
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(28);
  const { data: workouts } = useWorkouts(periodDays);
  const { data: healthRows } = useHealthRange(periodDays);
  const healthByDate = new Map(healthRows.map((row) => [row.dateJst, row.bodyBattery]));
  const grouped = new Map<string, RecoveryRow>();

  for (const workout of workouts) {
    const nextDate = dayjs(workout.dateJst).add(1, "day").format("YYYY-MM-DD");
    const bodyBattery = healthByDate.get(nextDate);
    if (bodyBattery === undefined) {
      continue;
    }

    const current = grouped.get(workout.dateJst);
    if (current === undefined) {
      grouped.set(workout.dateJst, {
        bodyBattery,
        date: dayjs(workout.dateJst).format("M/D"),
        durationMinutes: workout.durationMinutes,
        intensity: workout.perceivedIntensity ?? null,
        kind: workout.kind,
      });
      continue;
    }

    current.durationMinutes += workout.durationMinutes;
    if (workout.perceivedIntensity !== undefined) {
      current.intensity =
        current.intensity === null
          ? workout.perceivedIntensity
          : (current.intensity + workout.perceivedIntensity) / 2;
    }
  }

  const rows = [...grouped.values()];
  const chartRows = rows.map((row) => ({
    ...row,
    radius: row.intensity === null ? 5 : row.intensity + 3,
  }));
  const definition = defineChart({
    marks: [
      ruleY([50], { stroke: CHART_COLORS.faint, strokeDasharray: "4 3", strokeWidth: 1 }),
      crosshair({ marker: true, x: { band: true }, y: { label: true } }),
      dot(chartRows, {
        color: "kind",
        r: "radius",
        x: "durationMinutes",
        y: "bodyBattery",
      }),
    ],
    x: { axis: { label: "運動分(合計)" }, scale: scaleLinear },
    y: { axis: { label: "翌日 Body Battery" }, grid: true, scale: scaleLinear },
    color: {
      domain: ["hiit", "walk", "other"],
      legend: chartLegend,
      range: [CHART_COLORS.coral, CHART_COLORS.blue, CHART_COLORS.faint],
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text c="dimmed" fw={600} size="xs">
          トレーニング量 × 翌日回復(直近{periodDays}日)
        </Text>
        <ChartPeriodControl onChange={setPeriodDays} value={periodDays} />
      </Group>
      {rows.length === 0 ? (
        <Text c="dimmed" size="sm">
          翌日の Body Battery と結びつくトレーニングがありません
        </Text>
      ) : (
        <>
          <TanStackChart
            ariaDescription="運動分を横軸、翌日の Body Battery を縦軸、体感強度を円の大きさ、種別を色で示します。50を基準線としています。"
            ariaLabel="トレーニング量と翌日回復のバブル散布図"
            definition={definition}
            height={CHART_HEIGHT}
          />
          <details className="mt-3">
            <summary className="cursor-pointer text-sm">回復データ表</summary>
            <ChartDataTable
              caption="トレーニング量と翌日回復データ"
              columns={[
                { key: "date", label: "日付", render: (row: RecoveryRow) => row.date },
                {
                  key: "kind",
                  label: "種別",
                  render: (row: RecoveryRow) => row.kind,
                },
                {
                  key: "duration",
                  label: "運動分",
                  render: (row: RecoveryRow) => row.durationMinutes,
                },
                {
                  key: "battery",
                  label: "翌日BB",
                  render: (row: RecoveryRow) => row.bodyBattery,
                },
                {
                  key: "intensity",
                  label: "体感強度",
                  render: (row: RecoveryRow) => row.intensity ?? "データなし",
                },
              ]}
              rows={rows}
            />
          </details>
        </>
      )}
    </Box>
  );
}

export function WorkoutRecoveryBubbleChartFallback() {
  return (
    <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
  );
}
