import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconRefresh, IconStethoscope } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { GlowCard } from "~/components/glow-card";
import { RingMetricCard, TextMetricCard } from "~/features/dashboard/components/health-metric-card";
import {
  DASHBOARD_HEALTH_COPY,
  DASHBOARD_HEALTH_FALLBACK_VALUE,
  DASHBOARD_HEALTH_METRICS,
} from "~/features/dashboard/constants/health-metrics";
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
            message: DASHBOARD_HEALTH_COPY.notification.syncErrorMessage,
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: DASHBOARD_HEALTH_COPY.notification.syncSuccessMessage,
            title: DASHBOARD_HEALTH_COPY.notification.syncSuccessTitle,
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
            {DASHBOARD_HEALTH_COPY.title}
          </Text>
        </Group>
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            {DASHBOARD_HEALTH_COPY.empty.title}
          </Text>
          <Text size="xs" c="dimmed">
            {DASHBOARD_HEALTH_COPY.empty.description}
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
              {DASHBOARD_HEALTH_COPY.actions.syncGarmin}
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
              {DASHBOARD_HEALTH_COPY.actions.details}
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
          {DASHBOARD_HEALTH_COPY.title}
        </Text>
        <Text size="xs" c="dimmed">
          {HEALTH_SOURCE_LABELS[metrics.source]} · {dateLabel}
        </Text>
      </Group>
      <Group wrap="wrap" gap="md">
        <RingMetricCard
          accentColor={ACCENT_VARS.good}
          label={DASHBOARD_HEALTH_METRICS[0].label}
          subLabel={DASHBOARD_HEALTH_METRICS[0].subLabel}
          value={bodyBattery}
        />

        <RingMetricCard
          accentColor={ACCENT_VARS.violet}
          label={DASHBOARD_HEALTH_METRICS[1].label}
          subLabel={sleepHoursLabel}
          value={sleepScore}
        />

        <TextMetricCard
          label={DASHBOARD_HEALTH_METRICS[2].label}
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
          label={DASHBOARD_HEALTH_METRICS[3].label}
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
            {DASHBOARD_HEALTH_COPY.title}
          </Text>
          <Text size="xs" c="dimmed">
            {DASHBOARD_HEALTH_COPY.fallbackSource}
          </Text>
        </Group>
        <Group wrap="wrap" gap="md">
          {DASHBOARD_HEALTH_METRICS.map((metric) => (
            <Paper
              key={metric.id}
              radius="md"
              p="sm"
              className="bg-panel-2 border-bd flex-1 border"
              style={{ minWidth: 110 }}
            >
              <Stack gap={2} justify="center">
                <Text size="xs" c="dimmed">
                  {metric.label}
                </Text>
                <Text size="xl" fw={600}>
                  {DASHBOARD_HEALTH_FALLBACK_VALUE}
                </Text>
                <Text size="xs" c="dimmed">
                  {"subLabel" in metric ? metric.subLabel : DASHBOARD_HEALTH_METRICS[0].subLabel}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Group>
      </Paper>
    </Shimmer>
  );
}
