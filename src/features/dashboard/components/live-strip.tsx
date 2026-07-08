import { Box, Divider, Group, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { Suspense } from "react";

import { useDashboardHealth } from "~/features/dashboard/hooks/use-dashboard-health";

function LiveStripLastSyncLabel() {
  const { lastSyncRelativeLabel } = useDashboardHealth();

  return (
    <Text component="span" size="xs" c="var(--tx)">
      {lastSyncRelativeLabel}
    </Text>
  );
}

function LiveStripLastSyncLabelFallback() {
  return (
    <Shimmer loading>
      <Text component="span" size="xs" c="var(--tx)">
        たった今
      </Text>
    </Shimmer>
  );
}

export function LiveStrip() {
  return (
    <Group wrap="wrap" gap="md" style={{ rowGap: 8 }}>
      <Group gap={7}>
        <Box className="bg-good lp-pulse h-1.5 w-1.5 rounded-full" />
        <Text size="xs" fw={500} c="var(--tx)">
          Convex ライブ同期
        </Text>
      </Group>

      <Divider orientation="vertical" h={12} className="border-bd-2" />

      <Text size="xs" c="dimmed">
        Garmin 最終同期 ·
        <Suspense fallback={<LiveStripLastSyncLabelFallback />}>
          <LiveStripLastSyncLabel />
        </Suspense>
      </Text>

      <Divider orientation="vertical" h={12} className="border-bd-2" />

      <Text size="xs" c="dimmed">
        健康 · 学習 · 断食を一元管理
      </Text>
    </Group>
  );
}
