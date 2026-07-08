import { Stack, Switch, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";

import { useSetDemoMode } from "~/features/settings/api/set-demo-mode-mutation";
import { useSettings } from "~/features/settings/api/settings-query";
import { ACCENT_VARS } from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";

export function DemoModeSwitch() {
  const { data: settings } = useSettings();
  const setDemoMode = useSetDemoMode();

  return (
    <Stack gap="xs">
      <Switch
        checked={settings.demoMode}
        className="transition hover:brightness-110 active:brightness-95"
        disabled={setDemoMode.isPending}
        label="デモモード"
        onChange={(event) => {
          const enabled = event.currentTarget.checked;

          setDemoMode.mutate(
            { enabled, todayJst: todayJst() },
            {
              onError: () => {
                notifications.show({
                  color: "red",
                  message: "デモモードの切り替えに失敗しました",
                  title: "エラー",
                });
              },
            },
          );
        }}
      />
      {settings.demoMode && (
        <Text c={ACCENT_VARS.blue} size="xs">
          疑似データ流し込み中(20秒間隔)
        </Text>
      )}
    </Stack>
  );
}

export function DemoModeSwitchFallback() {
  return (
    <Shimmer loading>
      <Stack gap="xs">
        <Switch className="transition hover:brightness-110 active:brightness-95" label="デモモード" />
      </Stack>
    </Shimmer>
  );
}
