import { Badge, Group, Text } from "@mantine/core";
import { cn } from "cnfast";

import type { InsightsCorrelation } from "~/features/insights/types/insights";
import {
  formatCorrelation,
  isCorrelationInsufficient,
} from "~/features/insights/utils/format-correlation";
import { ACCENT_CLASSES } from "~/types/dashboard";

type CorrelationChartHeaderProps = Record<"label", string> &
  Record<"correlation", InsightsCorrelation>;

// Shared by the two ScatterChart sections (docs/plans/2026-07-08_06-insights.md
// §5.2): a chart title + an r/n badge, "faint" accent when data is
// insufficient (mirrors the muted-chip convention in types/dashboard.ts).
export function CorrelationChartHeader({ label, correlation }: CorrelationChartHeaderProps) {
  const accent = isCorrelationInsufficient(correlation.r, correlation.n) ? "faint" : "good";

  return (
    <Group justify="space-between" mb="xs">
      <Text c="dimmed" fw={600} size="xs">
        {label}
      </Text>
      <Badge
        className={cn(
          ACCENT_CLASSES[accent].border,
          ACCENT_CLASSES[accent].bg,
          ACCENT_CLASSES[accent].text,
          "border",
        )}
        size="sm"
        variant="outline"
      >
        {formatCorrelation(correlation.r, correlation.n)}
      </Badge>
    </Group>
  );
}
