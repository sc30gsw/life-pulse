import { Group, Paper, RingProgress, Stack, Text } from "@mantine/core";

import {
  ACCENT_VARS,
  HEALTH_SOURCE_LABELS,
  type HealthMetrics,
} from "~/features/dashboard/types/dashboard";

type HealthMetricsGridProps = {
  metrics: HealthMetrics;
};

export function HealthMetricsGrid({ metrics }: HealthMetricsGridProps) {
  return (
    <Paper radius={18} p="lg" className="bg-panel border-bd shadow-card border">
      <Group justify="space-between" mb="md">
        <Text
          size="10.5px"
          fw={600}
          tt="uppercase"
          c={ACCENT_VARS.faint}
          style={{ letterSpacing: "0.13em" }}
        >
          健康メトリクス · Garmin
        </Text>
        <Text size="xs" c="dimmed">
          {HEALTH_SOURCE_LABELS[metrics.source]}
        </Text>
      </Group>
      <Group wrap="wrap" gap="md">
        <Paper
          radius="md"
          p="sm"
          className="bg-panel-2 border-bd flex-1 border"
          style={{ minWidth: 110 }}
        >
          <Group gap="sm" wrap="nowrap">
            <RingProgress
              size={56}
              thickness={6}
              sections={[{ value: metrics.bodyBattery, color: ACCENT_VARS.good }]}
              label={
                <Text size="16px" fw={600} ta="center">
                  {metrics.bodyBattery}
                </Text>
              }
            />
            <Stack gap={2}>
              <Text size="xs" fw={600}>
                Body Battery
              </Text>
              <Text size="11px" c="dimmed">
                起床時
              </Text>
            </Stack>
          </Group>
        </Paper>

        <Paper
          radius="md"
          p="sm"
          className="bg-panel-2 border-bd flex-1 border"
          style={{ minWidth: 110 }}
        >
          <Group gap="sm" wrap="nowrap">
            <RingProgress
              size={56}
              thickness={6}
              sections={[{ value: metrics.sleepScore, color: ACCENT_VARS.violet }]}
              label={
                <Text size="16px" fw={600} ta="center">
                  {metrics.sleepScore}
                </Text>
              }
            />
            <Stack gap={2}>
              <Text size="xs" fw={600}>
                睡眠スコア
              </Text>
              <Text size="11px" c="dimmed">
                {(metrics.sleepMinutes / 60).toFixed(1)}h
              </Text>
            </Stack>
          </Group>
        </Paper>

        <Paper
          radius="md"
          p="sm"
          className="bg-panel-2 border-bd flex-1 border"
          style={{ minWidth: 110 }}
        >
          <Stack gap={2} justify="center">
            <Text size="xs" c="dimmed">
              HRV
            </Text>
            <Text size="xl" fw={600}>
              {metrics.hrv}
              <Text component="span" size="xs" c="dimmed">
                {" "}
                ms
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              安静時心拍{" "}
              <Text component="span" c="var(--tx)">
                {metrics.restingHr}
              </Text>
            </Text>
          </Stack>
        </Paper>

        <Paper
          radius="md"
          p="sm"
          className="bg-panel-2 border-bd flex-1 border"
          style={{ minWidth: 110 }}
        >
          <Stack gap={2} justify="center">
            <Text size="xs" c="dimmed">
              歩数
            </Text>
            <Text size="xl" fw={600}>
              {metrics.steps.toLocaleString("en-US")}
            </Text>
            <Text size="xs" c="dimmed">
              HIIT{" "}
              <Text component="span" c={ACCENT_VARS.good}>
                週2 達成
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Group>
    </Paper>
  );
}
