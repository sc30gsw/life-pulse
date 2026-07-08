import { Button, EmptyState, Group, Modal, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconDog } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState, type ComponentProps } from "react";

import { GlowCard } from "~/components/glow-card";
import { dogHistoryQuery } from "~/features/dashboard/api/dog-history-query";
import { DogHistoryDayCard } from "~/features/dashboard/components/dog-history-day-card";
import { DOG_PROFILE_COPY, DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";
import { ACCENT_VARS } from "~/types/dashboard";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";

const HISTORY_RANGE_DAYS = 7;

const HISTORY_MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

function openDogHistoryModal() {
  modals.open({
    centered: true,
    children: <DogHistoryModalContent />,
    styles: HISTORY_MODAL_STYLES,
    title: DOG_PROFILE_COPY.history.modalTitle,
  });
}

export function DogHistoryButton() {
  return (
    <Button
      className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
      onClick={openDogHistoryModal}
      size="xs"
      type="button"
      variant="outline"
    >
      {DOG_PROFILE_COPY.history.open}
    </Button>
  );
}

export function DogHistoryModalContent() {
  return (
    <Suspense fallback={<DogHistoryListFallback />}>
      <DogHistoryList />
    </Suspense>
  );
}

function DogHistoryList() {
  const { fromDateJst, toDateJst } = pastDateJstRange(todayJst(), HISTORY_RANGE_DAYS);
  const [showOlderDays, setShowOlderDays] = useState(false);
  const history = useSuspenseQuery(dogHistoryQuery(fromDateJst, toDateJst, showOlderDays)).data;

  if (history.days.length === 0) {
    return (
      <EmptyState
        icon={<IconDog size={48} />}
        title={
          <Text size="xl" fw={600} c="coral">
            {DOG_PROFILE_COPY.history.emptyTitle}
          </Text>
        }
        description={DOG_PROFILE_COPY.history.emptyDescription}
      >
        <EmptyState.Actions>
          <Button
            className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            variant="outline"
            onClick={() => modals.closeAll()}
          >
            {DOG_PROFILE_COPY.history.close}
          </Button>
        </EmptyState.Actions>
      </EmptyState>
    );
  }

  return (
    <Stack gap="md" className="max-h-[70vh] overflow-y-auto pr-1">
      <GlowCard
        p="sm"
        radius={14}
        className="border-bd bg-inset shadow-card relative overflow-hidden border"
      >
        <Group justify="space-between" gap="xs">
          <Stack gap={2}>
            <Text size="10.5px" fw={700} tt="uppercase" c={ACCENT_VARS.faint}>
              {DOG_PROFILE_COPY.history.latestRangeLabel}
            </Text>
            <Text size="sm" fw={700}>
              {DOG_PROFILE_COPY.history.rangeSummary(
                history.summary.totalDayCount,
                history.summary.eventCount,
              )}
            </Text>
          </Stack>
          {history.summary.hasOlderDays ? (
            <Button
              className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              onClick={() => setShowOlderDays((current) => !current)}
              size="xs"
              type="button"
              variant="outline"
            >
              {showOlderDays
                ? DOG_PROFILE_COPY.history.latestOnly
                : DOG_PROFILE_COPY.history.showOlderDays(history.summary.olderDayCount)}
            </Button>
          ) : null}
        </Group>
      </GlowCard>

      <Stack gap="sm">
        {history.days.map((day) => (
          <DogHistoryDayCard day={day} key={day.dateJst} />
        ))}
      </Stack>
    </Stack>
  );
}

function DogHistoryListFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        {[0, 1].map((groupIndex) => (
          <Stack gap={6} key={groupIndex}>
            <Text fw={600} size="sm">
              2026-07-0{groupIndex + 1}
            </Text>
            {[0, 1].map((rowIndex) => (
              <Group justify="space-between" key={rowIndex}>
                <Text size="sm">{DOG_TASK_COPY.history.fallbackTaskName}</Text>
                <Text c="dimmed" size="xs">
                  {DOG_TASK_COPY.history.fallbackByline}
                </Text>
              </Group>
            ))}
          </Stack>
        ))}
      </Stack>
    </Shimmer>
  );
}
