import { Button, Group, Paper, RingProgress, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconRefresh, IconStethoscope } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { GlowCard } from "~/components/glow-card";
import { useDashboardHealth } from "~/features/dashboard/hooks/use-dashboard-health";
import { useRequestGarminSync } from "~/features/health/hooks/use-request-garmin-sync";
import { ACCENT_SOLID_STYLE, ACCENT_VARS, HEALTH_SOURCE_LABELS } from "~/types/dashboard";

export function HealthMetricsGrid() {
  const { dateJst, metrics } = useDashboardHealth();
  const requestGarminSync = useRequestGarminSync();
  const dateLabel = (metrics?.dateJst ?? dateJst).replaceAll("-", "/");

  function onSync() {
    requestGarminSync.mutate(
      {},
      {
        onError: () => {
          notifications.show({
            color: "red",
            message: "同期のリクエストに失敗しました",
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "Garminとの同期をリクエストしました",
            title: "同期を開始しました",
          });
        },
      },
    );
  }

  if (metrics === null) {
    return (
      <GlowCard
        radius={18}
        p="lg"
        className="bg-panel border-bd shadow-card relative overflow-hidden border"
      >
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
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            今日のデータはまだありません
          </Text>
          <Text size="xs" c="dimmed">
            Garminを同期すると、睡眠・Body Battery・歩数をここに表示します。
          </Text>
          <Text size="xs" c="dimmed">
            {dateLabel}
          </Text>
          <Group gap="xs" justify="flex-end" mt="xs">
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              disabled={requestGarminSync.isPending}
              leftSection={<IconRefresh size={14} />}
              loading={requestGarminSync.isPending}
              onClick={onSync}
              size="xs"
              style={ACCENT_SOLID_STYLE.blue}
              type="button"
            >
              Garminを同期
            </Button>
            <Button
              className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95"
              component={Link}
              leftSection={<IconStethoscope size={14} />}
              size="xs"
              to="/health"
              type="button"
              variant="outline"
            >
              詳細
            </Button>
          </Group>
        </Stack>
      </GlowCard>
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
    <GlowCard
      radius={18}
      p="lg"
      className="bg-panel border-bd shadow-card relative overflow-hidden border"
    >
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
          {HEALTH_SOURCE_LABELS[metrics.source]} · {dateLabel}
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
    </GlowCard>
  );
}

export function HealthMetricsGridFallback() {
  return (
    <Shimmer loading>
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
            source: garmin
          </Text>
        </Group>
        <Group wrap="wrap" gap="md">
          {["Body Battery", "睡眠スコア", "HRV", "歩数"].map((label) => (
            <Paper
              key={label}
              radius="md"
              p="sm"
              className="bg-panel-2 border-bd flex-1 border"
              style={{ minWidth: 110 }}
            >
              <Stack gap={2} justify="center">
                <Text size="xs" c="dimmed">
                  {label}
                </Text>
                <Text size="xl" fw={600}>
                  88
                </Text>
                <Text size="xs" c="dimmed">
                  起床時
                </Text>
              </Stack>
            </Paper>
          ))}
        </Group>
      </Paper>
    </Shimmer>
  );
}
