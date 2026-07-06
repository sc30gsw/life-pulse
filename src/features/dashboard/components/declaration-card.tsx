import { Box, Group, Progress, Stack, Text } from "@mantine/core";

import {
  ACCENT_VARS,
  CATEGORY_LABELS,
  DECLARATION_STATUS_LABELS,
  type DeclarationItem,
  type DeclarationStatus,
} from "~/features/dashboard/types/dashboard";

// Single consumer: maps a declaration status to the accent key used for its dot + status text.
const STATUS_ACCENT = {
  done: "good",
  eroded: "coral",
  planned: "faint",
} as const satisfies Record<DeclarationStatus, keyof typeof ACCENT_VARS>;

type DeclarationCardProps = {
  actualMinutes: number;
  actualPercent: number;
  declarations: DeclarationItem[];
  totalMinutes: number;
};

export function DeclarationCard({
  actualMinutes,
  actualPercent,
  declarations,
  totalMinutes,
}: DeclarationCardProps) {
  return (
    <Box className="flex min-w-0 flex-1 flex-col gap-2">
      <Group justify="space-between" align="baseline">
        <Text
          size="10.5px"
          fw={600}
          tt="uppercase"
          c={ACCENT_VARS.faint}
          style={{ letterSpacing: "0.13em" }}
        >
          今日の学習
        </Text>
        <Text size="xs" c="dimmed">
          宣言 vs 実績
        </Text>
      </Group>

      <Group gap={8} align="baseline">
        <Text size="26px" fw={600}>
          {actualMinutes}
        </Text>
        <Text size="sm" c="dimmed">
          / {totalMinutes} 分
        </Text>
      </Group>

      <Progress
        value={actualPercent}
        color={ACCENT_VARS.good}
        size="sm"
        className="rounded-md"
        style={{ background: "var(--inset)" }}
      />

      <Stack gap={5} mt={2}>
        {declarations.map((item) => {
          const accent = STATUS_ACCENT[item.status];

          return (
            <Group key={`${item.startHm}-${item.category}`} gap={8}>
              <Box
                className="h-1.5 w-1.5 flex-none rounded-full"
                style={{ backgroundColor: ACCENT_VARS[accent] }}
              />
              <Text size="xs" c="dimmed">
                {item.startHm}
              </Text>
              <Text size="xs">{CATEGORY_LABELS[item.category]}</Text>
              <Text size="11px" c={ACCENT_VARS[accent]} className="ml-auto">
                {DECLARATION_STATUS_LABELS[item.status]}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Box>
  );
}
