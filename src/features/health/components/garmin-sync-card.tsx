import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { getRouteApi } from "@tanstack/react-router";
import { cn } from "cnfast";

import { useLastSync } from "~/features/health/hooks/use-last-sync";
import { useRequestGarminSync } from "~/features/health/hooks/use-request-garmin-sync";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

const TIME_MS = {
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
} as const satisfies Record<string, number>;

function formatRelativeTime(
  pastMs: NonNullable<ReturnType<typeof useLastSync>["data"]>["at"],
  nowMs: ReturnType<typeof routeApi.useLoaderData>["now"],
) {
  const deltaMs = Math.max(0, nowMs - pastMs);

  if (deltaMs < TIME_MS.MINUTE) {
    return "たった今";
  }

  if (deltaMs < TIME_MS.HOUR) {
    return `${Math.floor(deltaMs / TIME_MS.MINUTE)}分前`;
  }

  if (deltaMs < TIME_MS.DAY) {
    return `${Math.floor(deltaMs / TIME_MS.HOUR)}時間前`;
  }

  return `${Math.floor(deltaMs / TIME_MS.DAY)}日前`;
}

const routeApi = getRouteApi("/_authenticated/_self/health");

export function GarminSyncCard() {
  const { data: lastSync } = useLastSync();
  const requestGarminSync = useRequestGarminSync();
  const { now } = routeApi.useLoaderData();

  const statusAccent = lastSync === null ? "faint" : lastSync.ok ? "good" : "coral";
  const statusLabel = lastSync === null ? "未同期" : lastSync.ok ? "成功" : "失敗";

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

  return (
    <Group align="center" justify="space-between" wrap="wrap">
      <Stack gap={4}>
        <Badge
          className={cn(
            ACCENT_CLASSES[statusAccent].border,
            ACCENT_CLASSES[statusAccent].bg,
            ACCENT_CLASSES[statusAccent].text,
            "border",
          )}
          size="sm"
          variant="outline"
        >
          {statusLabel}
        </Badge>
        <Text c="dimmed" size="xs">
          {lastSync === null
            ? "まだ同期していません"
            : now === null
              ? null
              : `最終同期 ${formatRelativeTime(lastSync.at, now)}`}
        </Text>
        {lastSync !== null && !lastSync.ok && lastSync.message !== undefined && (
          <Text c={ACCENT_VARS.coral} size="xs">
            {lastSync.message}
          </Text>
        )}
      </Stack>

      <Button
        className="hover:brightness-120"
        disabled={requestGarminSync.isPending}
        loading={requestGarminSync.isPending}
        onClick={onSync}
        style={ACCENT_SOLID_STYLE.blue}
      >
        今すぐ同期
      </Button>
    </Group>
  );
}

export function GarminSyncCardFallback() {
  return (
    <Shimmer loading>
      <Group align="center" justify="space-between" wrap="wrap">
        <Stack gap={4}>
          <Badge
            className={cn(
              ACCENT_CLASSES.good.border,
              ACCENT_CLASSES.good.bg,
              ACCENT_CLASSES.good.text,
              "border",
            )}
            size="sm"
            variant="outline"
          >
            成功
          </Badge>
          <Text c="dimmed" size="xs">
            最終同期 5分前
          </Text>
        </Stack>

        <Button disabled style={ACCENT_SOLID_STYLE.blue}>
          今すぐ同期
        </Button>
      </Group>
    </Shimmer>
  );
}
