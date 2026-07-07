import { Group, RingProgress, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import cn from "cnfast";

import { useDashboardFasting } from "~/features/dashboard/hooks/use-dashboard-fasting";
import { ACCENT_VARS, FASTING_PHASE_LABELS, FASTING_PHASE_SUB_LABELS } from "~/types/dashboard";

import type { Doc } from "../../../../convex/_generated/dataModel";

// Single consumer: maps fasting phase to its accent key for the ring/labels.
const FASTING_PHASE_ACCENT = {
  early: "blue",
  fatburn: "amber",
  goal: "good",
} as const satisfies Record<Doc<"fastingWindows">["phase"], keyof typeof ACCENT_VARS>;

export function FastingGroup({ fastingFlash }: Record<"fastingFlash", boolean>) {
  const { fasting, fastingElapsedLabel, fastingRingPercent, fastingRemainLabel } =
    useDashboardFasting();
  const fastingPhase = fasting?.phase ?? "early";
  const phaseAccent = FASTING_PHASE_ACCENT[fastingPhase];

  return (
    <Group
      gap="md"
      wrap="nowrap"
      className={cn("relative min-w-[240px] flex-1", fastingFlash && "lp-flash")}
    >
      <RingProgress
        size={96}
        thickness={8}
        sections={[{ value: fastingRingPercent ?? 0, color: ACCENT_VARS[phaseAccent] }]}
        label={
          <Stack gap={1} align="center">
            <Text fw={600} size="lg" c={ACCENT_VARS[phaseAccent]}>
              {fastingElapsedLabel ?? ""}
            </Text>
            <Text size="9px" c={ACCENT_VARS.faint}>
              FAST
            </Text>
          </Stack>
        }
      />
      <Stack gap={4}>
        <Text
          size="10.5px"
          fw={600}
          tt="uppercase"
          c={ACCENT_VARS.faint}
          style={{ letterSpacing: "0.13em" }}
        >
          断食
        </Text>
        <Text fw={600} size="lg" c={ACCENT_VARS[phaseAccent]}>
          {fasting === null ? "未開始" : FASTING_PHASE_LABELS[fastingPhase]}
        </Text>
        <Text size="sm" c="dimmed">
          {fasting === null ? "断食を開始していません" : FASTING_PHASE_SUB_LABELS[fastingPhase]}
        </Text>
        <Text size="xs" c="dimmed">
          経過{" "}
          <Text component="span" size="xs" c="var(--tx)">
            {fastingElapsedLabel}
          </Text>{" "}
          · 残{" "}
          <Text component="span" size="xs" c="var(--tx)">
            {fastingRemainLabel}
          </Text>
        </Text>
      </Stack>
    </Group>
  );
}

export function FastingGroupFallback() {
  return (
    <Shimmer loading>
      <Group gap="md" wrap="nowrap" className="relative min-w-[240px] flex-1">
        <RingProgress
          size={96}
          thickness={8}
          sections={[{ value: 42, color: ACCENT_VARS.blue }]}
          label={
            <Stack gap={1} align="center">
              <Text fw={600} size="lg" c={ACCENT_VARS.blue}>
                06h42m
              </Text>
              <Text size="9px" c={ACCENT_VARS.faint}>
                FAST
              </Text>
            </Stack>
          }
        />
        <Stack gap={4}>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            断食
          </Text>
          <Text fw={600} size="lg" c={ACCENT_VARS.blue}>
            空腹期
          </Text>
          <Text size="sm" c="dimmed">
            12hで脂肪燃焼帯
          </Text>
          <Text size="xs" c="dimmed">
            経過 06h42m · 残 09h18m
          </Text>
        </Stack>
      </Group>
    </Shimmer>
  );
}
