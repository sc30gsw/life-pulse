import { Box, Group, Text } from "@mantine/core";
import { cell, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { tooltip } from "@tanstack/charts/tooltip";
import { useState } from "react";

import { ChartDataTable } from "~/components/charts/chart-data-table";
import { ChartPeriodControl } from "~/components/charts/chart-period-control";
import { CHART_COLORS, CHART_THEME } from "~/components/charts/chart-theme";
import { TanStackChart } from "~/components/charts/tanstack-chart";
import { type AnalyticsPeriodDays } from "~/features/insights/utils/analytics-range";
import { useStudyAnalytics } from "~/features/study/hooks/use-study-analytics";
import { dayjs } from "~/utils/dayjs";

const CHART_HEIGHT = 220;
const REASONS = [
  { key: "work", label: "仕事" },
  { key: "dog", label: "犬" },
  { key: "chore", label: "家事" },
  { key: "other", label: "その他" },
] as const satisfies readonly { key: "work" | "dog" | "chore" | "other"; label: string }[];

type HeatmapRow = { count: number; date: string; reason: string };

export function StudyInterruptionHeatmap() {
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(28);
  const { data } = useStudyAnalytics(periodDays);
  const rows: HeatmapRow[] = data.days.flatMap((day) =>
    REASONS.map((reason) => ({
      count: day.interruptionReasons[reason.key],
      date: dayjs(day.dateJst).format("M/D"),
      reason: reason.label,
    })),
  );
  const chartRows = rows.map((row) => ({
    ...row,
    bucket: row.count >= 3 ? "3+" : String(row.count),
  }));
  const definition = defineChart({
    marks: [cell(chartRows, { color: "bucket", x: "date", y: "reason" })],
    x: { scale: () => scaleBand<string>().padding(0.06) },
    y: { scale: () => scaleBand<string>().padding(0.12) },
    color: {
      domain: ["0", "1", "2", "3+"],
      range: [
        "var(--panel2)",
        "color-mix(in oklab, var(--violet) 35%, var(--panel2))",
        "color-mix(in oklab, var(--violet) 65%, var(--panel2))",
        CHART_COLORS.violet,
      ],
    },
    theme: CHART_THEME,
    tooltip,
  });

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text c="dimmed" fw={600} size="xs">
          学習中断ドライバー(直近{periodDays}日)
        </Text>
        <ChartPeriodControl onChange={setPeriodDays} value={periodDays} />
      </Group>
      <TanStackChart
        ariaDescription="日付と中断理由ごとの回数を色の濃さで示します。"
        ariaLabel="学習中断ドライバーのヒートマップ"
        definition={definition}
        height={CHART_HEIGHT}
      />
      <details className="mt-3">
        <summary className="cursor-pointer text-sm">中断データ表</summary>
        <ChartDataTable
          caption="学習中断ドライバー 日別データ"
          columns={[
            { key: "date", label: "日付", render: (row: HeatmapRow) => row.date },
            { key: "reason", label: "理由", render: (row: HeatmapRow) => row.reason },
            { key: "count", label: "回数", render: (row: HeatmapRow) => row.count },
          ]}
          rows={rows.filter((row) => row.count > 0)}
        />
      </details>
    </Box>
  );
}

export function StudyInterruptionHeatmapFallback() {
  return (
    <Box className="bg-panel-2 border-bd rounded-lg border" style={{ height: CHART_HEIGHT }} />
  );
}
