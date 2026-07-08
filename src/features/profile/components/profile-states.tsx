import { Button, EmptyState, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

export function MissingViewerEmptyState() {
  return (
    <EmptyState
      title={
        <Text size="xl" fw={600} c="coral">
          プロフィール未作成
        </Text>
      }
      description="ログイン情報に対応するプロフィールが見つかりません。"
    />
  );
}

export function ProfileFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <Text size="sm">プロフィールを読み込み中</Text>
        <Button>保存する</Button>
      </Stack>
    </Shimmer>
  );
}
