import { Box, Group, Text } from "@mantine/core";
import { defineChart, dot, link } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";
import { useState } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { ChartDataTable } from "~/components/charts/chart-data-table";
import { ChartPeriodControl } from "~/components/charts/chart-period-control";
import { CHART_COLORS, CHART_THEME, chartLegend } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { useFastingAnalytics } from "~/features/fasting/hooks/use-fasting-analytics";
import { type AnalyticsPeriodDays } from "~/features/insights/utils/analytics-range";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 240;

type FastingRow = {
  actualMinutes: number | null;
  date: string;
  targetMinutes: number;
  status: "達成" | "未達" | "実績なし";
};

export function FastingTargetActualChart() {
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(28);
  const { data } = useFastingAnalytics(periodDays);
  const rows: FastingRow[] = data.map((window: Doc<"fastingWindows">) => {
    const actualMinutes = window.actualMinutes ?? null;
    return {
      actualMinutes,
      date: dayjs(window.startedAt).tz("Asia/Tokyo").format("M/D"),
      targetMinutes: window.targetMinutes,
      status:
        actualMinutes === null
          ? "実績なし"
          : actualMinutes >= window.targetMinutes
            ? "達成"
            : "未達",
    };
  });
  const targetRows = rows.map((row) => ({
    date: row.date,
    kind: "目標",
    value: row.targetMinutes,
  }));
  const actualRows = rows.flatMap((row) =>
    row.actualMinutes === null ? [] : [{ date: row.date, kind: "実績", value: row.actualMinutes }],
  );
  const linkRows = rows.flatMap((row) =>
    row.actualMinutes === null
      ? []
      : [
          {
            date: row.date,
            kind: row.status,
            target: row.targetMinutes,
            actual: row.actualMinutes,
          },
        ],
  );
  const definition = defineChart({
    marks: [
      link(linkRows, {
        color: "kind",
        strokeWidth: 2,
        x1: "date",
        x2: "date",
        y1: "target",
        y2: "actual",
      }),
      dot(targetRows, { color: "kind", r: 4, x: "date", y: "value" }),
      dot(actualRows, { color: "kind", r: 5, x: "date", y: "value" }),
    ],
    x: { scale: () => scaleBand<string>().padding(0.2) },
    y: { axis: { label: "分" }, grid: true, nice: true, scale: scaleLinear },
    color: {
      legend: chartLegend,
      scale: () =>
        scaleOrdinal<string, string>()
          .domain(["目標", "実績", "達成", "未達"])
          .range([CHART_COLORS.violet, CHART_COLORS.blue, CHART_COLORS.good, CHART_COLORS.coral]),
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text c="dimmed" fw={600} size="xs">
          断食の目標対実績(直近{periodDays}日)
        </Text>
        <ChartPeriodControl onChange={setPeriodDays} value={periodDays} />
      </Group>
      {rows.length === 0 ? (
        <Text c="dimmed" size="sm">
          期間内に終了した断食がありません
        </Text>
      ) : (
        <>
          <TanStackChart
            ariaDescription="断食ごとの目標時間と実績時間を線で結び、達成・未達を色と表で示します。"
            ariaLabel="断食の目標対実績"
            definition={definition}
            height={CHART_HEIGHT}
          />
          <details className="mt-3">
            <summary className="cursor-pointer text-sm">断食データ表</summary>
            <ChartDataTable
              caption="断食の目標対実績データ"
              columns={[
                { key: "date", label: "開始日", render: (row: FastingRow) => row.date },
                {
                  key: "target",
                  label: "目標(分)",
                  render: (row: FastingRow) => row.targetMinutes,
                },
                {
                  key: "actual",
                  label: "実績(分)",
                  render: (row: FastingRow) => row.actualMinutes ?? "データなし",
                },
                { key: "status", label: "状態", render: (row: FastingRow) => row.status },
              ]}
              rows={rows}
            />
          </details>
        </>
      )}
    </Box>
  );
}

export function FastingTargetActualChartFallback() {
  return (
    <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
  );
}
