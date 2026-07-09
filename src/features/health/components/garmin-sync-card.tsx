import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";

import { useLastSync } from "~/features/health/hooks/use-last-sync";
import { useRequestGarminSync } from "~/features/health/hooks/use-request-garmin-sync";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";
import { formatRelativeTime } from "~/utils/relative-time";

export function GarminSyncCard() {
  const { data: lastSync } = useLastSync();
  const requestGarminSync = useRequestGarminSync();

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
        {/* Relative time is expected to differ between SSR and hydration. */}
        <Text c="dimmed" size="xs" suppressHydrationWarning>
          {lastSync === null
            ? "まだ同期していません"
            : `最終同期 ${formatRelativeTime(lastSync.at, Date.now())}`}
        </Text>
        {lastSync !== null && !lastSync.ok && lastSync.message !== undefined && (
          <Text c={ACCENT_VARS.coral} size="xs">
            {lastSync.message}
          </Text>
        )}
      </Stack>

      <Button
        className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
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
