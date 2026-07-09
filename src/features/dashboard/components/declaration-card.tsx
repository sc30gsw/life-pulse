import { Box, Group, Progress, Stack, Text } from "@mantine/core";

import type { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import { useStudyCategoriesQuery } from "~/features/study-categories/hooks/use-study-categories-query";
import { DECLARATION_STATUS_ACCENT } from "~/features/study/constants/declaration-status-accent";
import { ACCENT_VARS, type DeclarationStatus } from "~/types/dashboard";

type DeclarationCardProps = {
  actualMinutes: ReturnType<typeof useDashboardStudy>["declarationActualMinutes"];
  actualPercent: ReturnType<typeof useDashboardStudy>["declarationActualPercent"];
  declarations: ReturnType<typeof useDashboardStudy>["declarations"];
  totalMinutes: ReturnType<typeof useDashboardStudy>["declarationTotalMinutes"];
};

function declarationStatusLabel(status: DeclarationStatus) {
  switch (status) {
    case "declined":
      return "見送り";

    case "done":
      return "済";

    case "eroded":
      return "侵食";

    case "planned":
      return "予定";

    case "rescheduled":
      return "リスケ済";
  }
}

export function DeclarationCard({
  actualMinutes,
  actualPercent,
  declarations,
  totalMinutes,
}: DeclarationCardProps) {
  const { categoryName } = useStudyCategoriesQuery();

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
          const accent = DECLARATION_STATUS_ACCENT[item.status];

          return (
            <Group key={`${item.startHm}-${item.categoryId ?? "none"}`} gap={8}>
              <Box
                className="h-1.5 w-1.5 flex-none rounded-full"
                style={{ backgroundColor: ACCENT_VARS[accent] }}
              />
              <Text size="xs" c="dimmed">
                {item.startHm}
              </Text>
              <Text size="xs">{categoryName(item.categoryId)}</Text>
              <Text size="11px" c={ACCENT_VARS[accent]} className="ml-auto">
                {declarationStatusLabel(item.status)}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Box>
  );
}
