import { Group, Paper, RingProgress, Stack, Text } from "@mantine/core";

import { useDashboardHealth } from "~/features/dashboard/hooks/use-dashboard-health";
import { ACCENT_VARS, HEALTH_SOURCE_LABELS } from "~/features/dashboard/types/dashboard";

export function HealthMetricsGrid() {
  const { metrics } = useDashboardHealth();

  if (metrics === null) {
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
        </Group>
        <Text size="sm" c="dimmed">
          未計測
        </Text>
      </Paper>
    );
  }

  const bodyBattery = metrics.bodyBattery ?? 0;
  const sleepScore = metrics.sleepScore ?? 0;
  const sleepHoursLabel =
    metrics.sleepMinutes === undefined ? "—" : `${(metrics.sleepMinutes / 60).toFixed(1)}h`;
  const hrv = metrics.hrv ?? "—";
  const restingHr = metrics.restingHr ?? "—";
  const steps = metrics.steps ?? 0;

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
              sections={[{ value: bodyBattery, color: ACCENT_VARS.good }]}
              label={
                <Text size="16px" fw={600} ta="center">
                  {bodyBattery}
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
              sections={[{ value: sleepScore, color: ACCENT_VARS.violet }]}
              label={
                <Text size="16px" fw={600} ta="center">
                  {sleepScore}
                </Text>
              }
            />
            <Stack gap={2}>
              <Text size="xs" fw={600}>
                睡眠スコア
              </Text>
              <Text size="11px" c="dimmed">
                {sleepHoursLabel}
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
              {hrv}
              <Text component="span" size="xs" c="dimmed">
                {" "}
                ms
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              安静時心拍{" "}
              <Text component="span" c="var(--tx)">
                {restingHr}
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
              {steps.toLocaleString("en-US")}
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
