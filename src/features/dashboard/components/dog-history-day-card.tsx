import { Badge, Group, Stack, Text } from "@mantine/core";
import type { FunctionReturnType } from "convex/server";

import { api } from "~/../convex/_generated/api";
import { GlowCard } from "~/components/glow-card";
import { formatClockTime } from "~/features/dashboard/utils/format";
import { DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";

type DogHistoryDay = FunctionReturnType<typeof api.queries.dog.history.history>["days"][number];

export function DogHistoryDayCard({ day }: Record<"day", DogHistoryDay>) {
  return (
    <GlowCard
      p="sm"
      radius={14}
      className="border-bd bg-panel-2 shadow-card relative overflow-hidden border"
    >
      <Stack gap={8}>
        <Group justify="space-between" align="center">
          <Text fw={700} size="sm">
            {day.dateJst}
          </Text>
          <Badge variant="outline" className="border-coral bg-coral/16 text-coral">
            {DOG_TASK_COPY.history.eventCount(day.events.length)}
          </Badge>
        </Group>
        <Stack gap={6}>
          {day.events.map((event) => (
            <Group
              justify="space-between"
              key={event.id}
              className="border-bd bg-inset rounded-lg border px-3 py-2"
              wrap="nowrap"
            >
              <Text size="sm" fw={600} className="text-tx">
                {event.taskName}
              </Text>
              <Text c="dimmed" size="xs" className="shrink-0">
                {event.byDisplayName} · {formatClockTime(event.at)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </GlowCard>
  );
}
