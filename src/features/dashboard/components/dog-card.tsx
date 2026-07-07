import {
  Avatar,
  Badge,
  Box,
  Button,
  EmptyState,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconDog } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "cnfast";
import { Suspense, type ComponentProps } from "react";

import { GlowCard } from "~/components/glow-card";
import { dogHistoryQuery } from "~/features/dashboard/api/dog-history-query";
import { useDashboardDog } from "~/features/dashboard/hooks/use-dashboard-dog";
import { formatClockTime } from "~/features/dashboard/utils/format";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  DOG_EVENT_LABELS,
} from "~/types/dashboard";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";

const HISTORY_RANGE_DAYS = 7;

const HISTORY_MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

function openHistoryModal() {
  modals.open({
    centered: true,
    children: <DogHistoryModalContent />,
    styles: HISTORY_MODAL_STYLES,
    title: "犬のお世話履歴",
  });
}

export function DogCard() {
  const { dogCare, dogFlash, dogName, onToggleDogCare } = useDashboardDog();
  const pendingCount = dogCare.filter((item) => !item.done).length;
  const pendingAccent = pendingCount > 0 ? ACCENT_CLASSES.coral : ACCENT_CLASSES.good;

  return (
    <GlowCard
      className={cn(
        "bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border",
        dogFlash && "lp-flash",
      )}
      p="lg"
      radius={18}
    >
      <Group justify="space-between" mb="md">
        <Group gap={11}>
          <Avatar
            alt={dogName}
            className={cn(ACCENT_CLASSES.coral.border, "border")}
            name={dogName}
            radius="md"
            size={34}
            src="/assets/hamaro.JPEG"
          />
          <Stack gap={0}>
            <Text size="sm" fw={600}>
              {dogName}
            </Text>
            <Text
              size="10.5px"
              fw={600}
              tt="uppercase"
              c={ACCENT_VARS.faint}
              style={{ letterSpacing: "0.13em" }}
            >
              トイプードル · 今日のケア
            </Text>
          </Stack>
        </Group>
        <Group gap={8}>
          <Badge
            variant="outline"
            className={cn(pendingAccent.border, pendingAccent.bg, pendingAccent.text)}
          >
            {pendingCount > 0 ? `未実施 ${pendingCount} 件` : "すべて完了"}
          </Badge>
          <Button
            className="border-bd-2 text-tx"
            onClick={openHistoryModal}
            size="xs"
            type="button"
            variant="outline"
          >
            履歴
          </Button>
        </Group>
      </Group>

      <Stack gap={8}>
        {dogCare.map((item) => (
          <UnstyledButton
            key={item.kind}
            type="button"
            aria-pressed={item.done}
            onClick={() => onToggleDogCare(item.kind)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left",
              item.done
                ? "border-bd bg-panel-2"
                : cn(ACCENT_CLASSES.coral.border, ACCENT_CLASSES.coral.bg),
            )}
          >
            {item.done ? (
              <Box
                style={ACCENT_SOLID_STYLE.good}
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              >
                ✓
              </Box>
            ) : (
              <Box className={cn(ACCENT_CLASSES.coral.border, "h-5 w-5 rounded-full border-2")} />
            )}
            <Text size="sm" fw={500} className="text-tx">
              {DOG_EVENT_LABELS[item.kind]}
            </Text>
            <Text size="xs" c="dimmed" className="ml-auto">
              {item.done ? (item.by === "self" ? "本人" : "妻") : "未"}
            </Text>
          </UnstyledButton>
        ))}
      </Stack>
    </GlowCard>
  );
}

function DogHistoryModalContent() {
  return (
    <Suspense fallback={<DogHistoryListFallback />}>
      <DogHistoryList />
    </Suspense>
  );
}

function DogHistoryList() {
  const { fromDateJst, toDateJst } = pastDateJstRange(todayJst(), HISTORY_RANGE_DAYS);
  const history = useSuspenseQuery(dogHistoryQuery(fromDateJst, toDateJst)).data;

  if (history.days.length === 0) {
    return (
      <EmptyState
        icon={<IconDog size={48} />}
        title={
          <Text size="xl" fw={600} c="coral">
            履歴なし
          </Text>
        }
        description="犬のお世話履歴がありません"
      >
        <EmptyState.Actions>
          <Button variant="outline" onClick={() => modals.closeAll()}>
            閉じる
          </Button>
        </EmptyState.Actions>
      </EmptyState>
    );
  }

  return (
    <Stack gap="md">
      {history.days.map((day) => (
        <Stack gap={6} key={day.dateJst}>
          <Text fw={600} size="sm">
            {day.dateJst}
          </Text>
          {day.events.map((event) => (
            <Group justify="space-between" key={event.id}>
              <Text size="sm">{DOG_EVENT_LABELS[event.kind]}</Text>
              <Text c="dimmed" size="xs">
                {event.byDisplayName} · {formatClockTime(event.at)}
              </Text>
            </Group>
          ))}
        </Stack>
      ))}
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
                <Text size="sm">朝散歩</Text>
                <Text c="dimmed" size="xs">
                  本人 · 06:30:00
                </Text>
              </Group>
            ))}
          </Stack>
        ))}
      </Stack>
    </Shimmer>
  );
}

export function DogCardFallback() {
  return (
    <Shimmer loading>
      <Paper
        className="bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border"
        p="lg"
        radius={18}
      >
        <Group justify="space-between" mb="md">
          <Group gap={11}>
            <Avatar
              alt="ハマロ"
              className="border-coral border"
              name="ハマロ"
              radius="xl"
              size={34}
              src="/assets/hamaro.JPEG"
            />
            <Stack gap={0}>
              <Text size="sm" fw={600}>
                ハマロ
              </Text>
              <Text size="10.5px" fw={600} tt="uppercase" c={ACCENT_VARS.faint}>
                トイプードル · 今日のケア
              </Text>
            </Stack>
          </Group>
          <Badge variant="outline" className="border-coral bg-coral/16 text-coral">
            未実施 3 件
          </Badge>
        </Group>

        <Stack gap={8}>
          {["朝散歩", "朝ごはん", "薬", "トイレ"].map((label) => (
            <Group
              key={label}
              className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
              gap={12}
            >
              <Box className="border-coral h-5 w-5 rounded-full border-2" />
              <Text size="sm" fw={500}>
                {label}
              </Text>
              <Text size="xs" c="dimmed" className="ml-auto">
                未
              </Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Shimmer>
  );
}
