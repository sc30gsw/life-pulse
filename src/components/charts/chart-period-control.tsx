import { Group, Radio } from "@mantine/core";
import { useId } from "react";

import {
  ANALYTICS_PERIODS,
  type AnalyticsPeriodDays,
} from "~/features/insights/utils/analytics-range";

interface ChartPeriodControlProps {
  onChange: (days: AnalyticsPeriodDays) => void;
  value: AnalyticsPeriodDays;
}

export function ChartPeriodControl({ onChange, value }: ChartPeriodControlProps) {
  const groupId = useId();

  return (
    <Radio.Group
      aria-label="分析期間"
      name={`chart-period-${groupId}`}
      onChange={(nextValue) => onChange(Number(nextValue) as AnalyticsPeriodDays)}
      value={String(value)}
    >
      <Group gap="xs">
        {ANALYTICS_PERIODS.map((period) => (
          <Radio key={period.days} label={period.label} value={String(period.days)} />
        ))}
      </Group>
    </Radio.Group>
  );
}
