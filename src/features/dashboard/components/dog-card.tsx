import { Badge, Box, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";

import { GlowCard } from "~/components/glow-card";
import { useDashboardDog } from "~/features/dashboard/hooks/use-dashboard-dog";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  DOG_EVENT_LABELS,
} from "~/features/dashboard/types/dashboard";

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
          <Box
            className={cn(
              "flex h-8.5 w-8.5 items-center justify-center rounded-lg border font-bold",
              ACCENT_CLASSES.coral.border,
              ACCENT_CLASSES.coral.bg,
              ACCENT_CLASSES.coral.text,
            )}
          >
            {dogName.slice(0, 1)}
          </Box>
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
        <Badge
          variant="outline"
          className={cn(pendingAccent.border, pendingAccent.bg, pendingAccent.text)}
        >
          {pendingCount > 0 ? `未実施 ${pendingCount} 件` : "すべて完了"}
        </Badge>
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
            <Box className="border-coral bg-coral/16 text-coral flex h-8.5 w-8.5 items-center justify-center rounded-lg border font-bold">
              ハ
            </Box>
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
