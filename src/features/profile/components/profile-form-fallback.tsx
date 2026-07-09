import { Button, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

export function ProfileFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <Text size="sm">プロフィールを読み込み中</Text>
        <Button className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100">
          保存する
        </Button>
      </Stack>
    </Shimmer>
  );
}
