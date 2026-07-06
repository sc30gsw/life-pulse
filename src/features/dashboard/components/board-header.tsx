import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import type { JSX } from "react";

import type { useLiveBoard } from "~/features/dashboard/hooks/use-live-board";
import { ACCENT_VARS } from "~/features/dashboard/types/dashboard";

type BoardHeaderProps = Pick<
  ReturnType<typeof useLiveBoard>,
  "clockDateLabel" | "clockTime" | "onToggleTheme" | "theme"
> &
  Record<"userMenuSlot", JSX.Element>;

export function BoardHeader({
  clockDateLabel,
  clockTime,
  onToggleTheme,
  theme,
  userMenuSlot,
}: BoardHeaderProps) {
  return (
    <Group component="header" wrap="wrap" gap="md" align="center">
      <Group mr="auto" gap={11}>
        <Box className="bg-good lp-pulse h-2.5 w-2.5 rounded-full shadow-[0_0_12px_var(--good)]" />
        <Stack gap={0}>
          <Text component="h1" fw={700} size="lg" m={0}>
            Life Pulse
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Live Board
          </Text>
        </Stack>
      </Group>

      <Stack gap={2} align="flex-end">
        <Text fw={600} size="xl">
          {clockTime}
        </Text>
        <Text size="xs" c="dimmed">
          {clockDateLabel} · JST
        </Text>
      </Stack>

      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        onClick={onToggleTheme}
        className="border-bd bg-inset"
        aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      >
        {theme === "dark" ? <IconMoon size={16} className="text-white" /> : <IconSun size={16} />}
      </ActionIcon>

      {userMenuSlot}
    </Group>
  );
}
