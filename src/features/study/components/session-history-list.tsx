import { Badge, Chip, EmptyState, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconHistory } from "@tabler/icons-react";
import { cn } from "cnfast";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useStudyCategoriesQuery } from "~/features/study-categories/hooks/use-study-categories-query";
import { useSessionHistory } from "~/features/study/hooks/use-session-history";
import {
  ACCENT_CLASSES,
  ACCENT_VARS,
  type InterruptionReason,
  type SessionStatus,
} from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

const STATUS_ACCENT = {
  abandoned: "faint",
  active: "good",
  completed: "good",
  paused: "amber",
} as const satisfies Record<SessionStatus, keyof typeof ACCENT_VARS>;

function formatStartTime(startedAt: Doc<"studySessions">["startedAt"]) {
  return dayjs(startedAt).tz("Asia/Tokyo").format("HH:mm");
}

function reasonLabel(reason: InterruptionReason) {
  switch (reason) {
    case "chore":
      return "家事";

    case "dog":
      return "犬";

    case "other":
      return "その他";

    case "work":
      return "仕事";
  }
}

function sessionStatusLabel(status: SessionStatus) {
  switch (status) {
    case "abandoned":
      return "放置終了";

    case "active":
      return "進行中";

    case "completed":
      return "完了";

    case "paused":
      return "中断中";
  }
}

function formatReasonBreakdown(reasons: InterruptionReason[]) {
  const counts = new Map<InterruptionReason, number>();

  for (const reason of reasons) {
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => `${reasonLabel(reason)}×${count}`)
    .join(" · ");
}

export function SessionHistoryList() {
  const history = useSessionHistory();
  const { categoryName } = useStudyCategoriesQuery();

  if (history.days.length === 0) {
    return (
      <EmptyState
        icon={<IconHistory size={48} />}
        title={
          <Text size="xl" fw={600} c="blue">
            履歴なし
          </Text>
        }
        description="セッション履歴がありません"
      />
    );
  }

  return (
    <Stack gap="md">
      {history.days.map((day) => (
        <Stack gap={6} key={day.dateJst}>
          <Text fw={600} size="sm">
            {day.dateJst}
          </Text>
          {day.sessions.map((session) => {
            const accent = STATUS_ACCENT[session.status];

            return (
              <Group gap={8} key={session.id} wrap="wrap">
                <Text c="dimmed" className="tabular-nums" size="xs">
                  {formatStartTime(session.startedAt)}
                </Text>
                <Chip
                  classNames={{
                    label: cn(
                      "rounded-lg border px-3 py-1.5 text-xs",
                      ACCENT_CLASSES.good.border,
                      ACCENT_CLASSES.good.bg,
                      ACCENT_CLASSES.good.text,
                      "font-semibold",
                    ),
                  }}
                >
                  {categoryName(session.categoryId)}
                </Chip>
                <Text className="tabular-nums" size="xs">
                  {session.actualMinutes}分
                </Text>
                <Text c="dimmed" size="xs">
                  中断 {session.interruptionCount} 回
                  {session.reasons.length > 0 && `(${formatReasonBreakdown(session.reasons)})`}
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
                  {sessionStatusLabel(session.status)}
                </Badge>
              </Group>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}

export function SessionHistoryListFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        {[0, 1].map((groupIndex) => (
          <Stack gap={6} key={groupIndex}>
            <Text fw={600} size="sm">
              2026-07-0{groupIndex + 1}
            </Text>
            {[0, 1].map((rowIndex) => (
              <Group gap={8} key={rowIndex}>
                <Text c="dimmed" className="tabular-nums" size="xs">
                  06:00
                </Text>
                <Text size="sm">TOEIC</Text>
                <Text className="tabular-nums" size="xs">
                  30分
                </Text>
                <Text c="dimmed" size="xs">
                  中断 0 回
                </Text>
              </Group>
            ))}
          </Stack>
        ))}
      </Stack>
    </Shimmer>
  );
}
