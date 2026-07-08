import { Group, Paper, RingProgress, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

type RingMetricCardProps = {
  accentColor: string;
  label: string;
  subLabel: string;
  value: number;
};

type TextMetricCardProps = {
  label: string;
  subLabel: ReactNode;
  value: ReactNode;
};

export function RingMetricCard({ accentColor, label, subLabel, value }: RingMetricCardProps) {
  return (
    <MetricPaper>
      <Group gap="sm" wrap="nowrap">
        <RingProgress
          size={56}
          thickness={6}
          sections={[{ value, color: accentColor }]}
          label={
            <Text size="16px" fw={600} ta="center">
              {value}
            </Text>
          }
        />
        <Stack gap={2}>
          <Text size="xs" fw={600}>
            {label}
          </Text>
          <Text size="11px" c="dimmed">
            {subLabel}
          </Text>
        </Stack>
      </Group>
    </MetricPaper>
  );
}

export function TextMetricCard({ label, subLabel, value }: TextMetricCardProps) {
  return (
    <MetricPaper>
      <Stack gap={2} justify="center">
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="xl" fw={600}>
          {value}
        </Text>
        <Text size="xs" c="dimmed">
          {subLabel}
        </Text>
      </Stack>
    </MetricPaper>
  );
}

function MetricPaper({ children }: Record<"children", ReactNode>) {
  return (
    <Paper radius="md" p="sm" className="bg-panel-2 border-bd flex-1 border" style={{ minWidth: 110 }}>
      {children}
    </Paper>
  );
}
