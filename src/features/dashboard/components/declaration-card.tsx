import { Box, Group, Progress, Stack, Text } from "@mantine/core";

import type { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import {
  ACCENT_VARS,
  CATEGORY_LABELS,
  DECLARATION_STATUS_LABELS,
  type DeclarationStatus,
  type SessionCategory,
} from "~/features/dashboard/types/dashboard";

const STATUS_ACCENT = {
  done: "good",
  eroded: "coral",
  planned: "faint",
  rescheduled: "violet",
} as const satisfies Record<DeclarationStatus, keyof typeof ACCENT_VARS>;

type DeclarationCardProps = {
  actualMinutes: ReturnType<typeof useDashboardStudy>["declarationActualMinutes"];
  actualPercent: ReturnType<typeof useDashboardStudy>["declarationActualPercent"];
  declarations: ReturnType<typeof useDashboardStudy>["declarations"];
  totalMinutes: ReturnType<typeof useDashboardStudy>["declarationTotalMinutes"];
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
        <Text className="lp-brandtext" size="26px" fw={600}>
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
              <Text size="xs">{CATEGORY_LABELS[item.category as SessionCategory]}</Text>
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
