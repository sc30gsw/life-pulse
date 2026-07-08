import { Badge, EmptyState, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconHourglass } from "@tabler/icons-react";
import { cn } from "cnfast";

import type { Doc } from "~/../convex/_generated/dataModel";
import { FASTING_PHASE_ACCENT } from "~/features/fasting/constants/fasting-phase-accent";
import { useFastingHistory } from "~/features/fasting/hooks/use-fasting-history";
import { ACCENT_CLASSES } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

function formatStartedAt(startedAt: Doc<"fastingWindows">["startedAt"]) {
  return dayjs(startedAt).tz("Asia/Tokyo").format("YYYY/M/D HH:mm");
}

function phaseLabel(phase: Doc<"fastingWindows">["phase"]) {
  switch (phase) {
    case "early":
      return "空腹期";
    case "fatburn":
      return "脂肪燃焼帯";
    case "goal":
      return "目標達成";
  }
}

export function FastingHistoryList() {
  const { data: history } = useFastingHistory();

  if (history.length === 0) {
    return (
      <EmptyState
        icon={<IconHourglass size={48} />}
        title={
          <Text size="xl" fw={600} c="blue">
            断食の履歴はまだありません
          </Text>
        }
        description="断食の履歴がありません"
      />
    );
  }

  return (
    <Stack gap={8}>
      {history.map((window) => {
        const accent = FASTING_PHASE_ACCENT[window.phase];

        return (
          <Group
            className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
            gap={8}
            key={window._id}
            wrap="wrap"
          >
            <Text className="tabular-nums" fw={600} size="sm">
              {formatStartedAt(window.startedAt)}
            </Text>
            <Text c="dimmed" className="tabular-nums" size="xs">
              実績 {window.actualMinutes ?? 0}分
            </Text>
            <Text c="dimmed" className="tabular-nums" size="xs">
              目標 {window.targetMinutes}分
            </Text>
            <Badge
              className={cn(
                ACCENT_CLASSES[accent].border,
                ACCENT_CLASSES[accent].bg,
                ACCENT_CLASSES[accent].text,
                "ml-auto border",
              )}
              size="sm"
              variant="outline"
            >
              {phaseLabel(window.phase)}
            </Badge>
          </Group>
        );
      })}
    </Stack>
  );
}

export function FastingHistoryListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {[0, 1].map((index) => (
          <Group
            className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
            gap={8}
            key={index}
          >
            <Text className="tabular-nums" fw={600} size="sm">
              2026/7/{index + 1} 20:00
            </Text>
            <Text c="dimmed" className="tabular-nums" size="xs">
              実績 480分
            </Text>
            <Text c="dimmed" className="tabular-nums" size="xs">
              目標 960分
            </Text>
          </Group>
        ))}
      </Stack>
    </Shimmer>
  );
}
