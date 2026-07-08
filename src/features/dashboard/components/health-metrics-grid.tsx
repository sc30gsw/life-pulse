import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconRefresh, IconStethoscope } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { GlowCard } from "~/components/glow-card";
import { RingMetricCard, TextMetricCard } from "~/features/dashboard/components/health-metric-card";
import { DASHBOARD_HEALTH_METRICS } from "~/features/dashboard/constants/health-metrics";
import { useDashboardHealth } from "~/features/dashboard/hooks/use-dashboard-health";
import { useRequestGarminSync } from "~/features/health/hooks/use-request-garmin-sync";
import { ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

function healthSourceLabel(
  source: NonNullable<ReturnType<typeof useDashboardHealth>["metrics"]>["source"],
) {
  switch (source) {
    case "demo":
      return "source: demo";

    case "garmin":
      return "source: garmin";

    case "manual":
      return "source: manual";
  }
}

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
          {healthSourceLabel(metrics.source)} · {dateLabel}
        </Text>
      </Group>
      <Group wrap="wrap" gap="md">
        <RingMetricCard
          accentColor={ACCENT_VARS[DASHBOARD_HEALTH_METRICS.bodyBattery.accent]}
          label="Body Battery"
          subLabel="起床時"
          value={bodyBattery}
        />

        <RingMetricCard
          accentColor={ACCENT_VARS[DASHBOARD_HEALTH_METRICS.sleepScore.accent]}
          label="睡眠スコア"
          subLabel={sleepHoursLabel}
          value={sleepScore}
        />

        <TextMetricCard
          label="HRV"
          value={
            <>
              {hrv}
              <Text component="span" size="xs" c="dimmed">
                {" "}
                ms
              </Text>
            </>
          }
          subLabel={
            <>
              安静時心拍{" "}
              <Text component="span" c="var(--tx)">
                {restingHr}
              </Text>
            </>
          }
        />

        <TextMetricCard
          label="歩数"
          value={steps.toLocaleString("en-US")}
          subLabel={
            <>
              HIIT{" "}
              <Text component="span" c={ACCENT_VARS.good}>
                週2 達成
              </Text>
            </>
          }
        />
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
          <TextMetricCard label="Body Battery" subLabel="起床時" value="88" />
          <TextMetricCard label="睡眠スコア" subLabel="起床時" value="88" />
          <TextMetricCard label="HRV" subLabel="起床時" value="88" />
          <TextMetricCard label="歩数" subLabel="起床時" value="88" />
        </Group>
      </Paper>
    </Shimmer>
  );
}
