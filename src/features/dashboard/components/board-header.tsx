import { ActionIcon, Box, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { cn } from "cnfast";
import type { ReactNode } from "react";

import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  type Perspective,
  type ThemeMode,
} from "~/features/dashboard/types/dashboard";

type BoardHeaderProps = {
  clockDateLabel: string;
  clockTime: string;
  isDemoRunning: boolean;
  onSetPerspective: (perspective: Perspective) => void;
  onToggleDemo: () => void;
  onToggleTheme: () => void;
  perspective: Perspective;
  theme: ThemeMode;
  userMenuSlot: ReactNode;
};

export function BoardHeader({
  clockDateLabel,
  clockTime,
  isDemoRunning,
  onSetPerspective,
  onToggleDemo,
  onToggleTheme,
  perspective,
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

      <Paper radius="md" p={3} className="bg-inset border-bd border">
        <Group gap={2}>
          <UnstyledButton
            type="button"
            aria-pressed={perspective === "self"}
            onClick={() => onSetPerspective("self")}
            style={perspective === "self" ? ACCENT_SOLID_STYLE.good : undefined}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-semibold",
              perspective !== "self" && "text-dim",
            )}
          >
            本人
          </UnstyledButton>
          <UnstyledButton
            type="button"
            aria-pressed={perspective === "partner"}
            onClick={() => onSetPerspective("partner")}
            style={perspective === "partner" ? ACCENT_SOLID_STYLE.blue : undefined}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-semibold",
              perspective !== "partner" && "text-dim",
            )}
          >
            パートナー
          </UnstyledButton>
        </Group>
      </Paper>

      <UnstyledButton
        type="button"
        aria-pressed={isDemoRunning}
        onClick={onToggleDemo}
        className={
          isDemoRunning
            ? cn(
                ACCENT_CLASSES.good.border,
                ACCENT_CLASSES.good.bg,
                ACCENT_CLASSES.good.text,
                "rounded-lg border px-3.5 py-2",
              )
            : "border-bd bg-inset text-dim rounded-lg border px-3.5 py-2"
        }
      >
        <Group gap={8}>
          <Box className={cn("h-1.5 w-1.5 rounded-full bg-current", isDemoRunning && "lp-pulse")} />
          <Text size="xs" fw={600}>
            {isDemoRunning ? "デモ配信中" : "デモ配信"}
          </Text>
        </Group>
      </UnstyledButton>

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
