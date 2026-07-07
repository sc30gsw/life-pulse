import { Badge, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useSessionHistory } from "~/features/study/hooks/use-session-history";
import {
  ACCENT_CLASSES,
  ACCENT_VARS,
  CATEGORY_LABELS,
  SESSION_STATUS_LABELS,
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

export function SessionHistoryList() {
  const history = useSessionHistory();

  if (history.days.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        履歴なし
      </Text>
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
                <Text size="sm">{CATEGORY_LABELS[session.category]}</Text>
                <Text className="tabular-nums" size="xs">
                  {session.actualMinutes}分
                </Text>
                <Text c="dimmed" size="xs">
                  中断 {session.interruptionCount} 回
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
                  {SESSION_STATUS_LABELS[session.status]}
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
