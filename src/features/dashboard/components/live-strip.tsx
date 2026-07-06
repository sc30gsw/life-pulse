import { Box, Divider, Group, Text } from "@mantine/core";

type LiveStripProps = {
  lastSyncRelativeLabel: string;
};

export function LiveStrip({ lastSyncRelativeLabel }: LiveStripProps) {
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
        Garmin 最終同期 ·{" "}
        <Text component="span" size="xs" c="var(--tx)">
          {lastSyncRelativeLabel}
        </Text>
      </Text>

      <Divider orientation="vertical" h={12} className="border-bd-2" />

      <Text size="xs" c="dimmed">
        2端末デモ対応 · モバイル/デスクトップ
      </Text>
    </Group>
  );
}
