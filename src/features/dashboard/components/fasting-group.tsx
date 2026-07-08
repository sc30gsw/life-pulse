import { Button, Group, Modal, RingProgress, Stack, Text } from "@mantine/core";
import { useDisclosure, type UseDisclosureReturnValue } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Shimmer } from "@shimmer-from-structure/react";
import cn from "cnfast";
import { Suspense, type ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useDashboardFasting } from "~/features/dashboard/hooks/use-dashboard-fasting";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";
import { FastingStartModal } from "~/features/fasting/components/fasting-start-modal";
import { useEndFasting } from "~/features/fasting/hooks/use-end-fasting";
import {
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  FASTING_PHASE_LABELS,
  FASTING_PHASE_SUB_LABELS,
} from "~/types/dashboard";

const CONFIRM_MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

// Single consumer: maps fasting phase to its accent key for the ring/labels.
const FASTING_PHASE_ACCENT = {
  early: "blue",
  fatburn: "amber",
  goal: "good",
} as const satisfies Record<Doc<"fastingWindows">["phase"], keyof typeof ACCENT_VARS>;

export function FastingGroup({
  fastingFlash: fastingFlashOverride,
}: Partial<Record<"fastingFlash", boolean>> = {}) {
  const {
    fasting,
    fastingElapsedLabel,
    fastingFlashRef,
    fastingRingPercent,
    fastingRemainLabel,
    suppressNextFastingFlash,
  } = useDashboardFasting();
  const endFasting = useEndFasting();
  const [startModalOpened, { close: closeStartModal, open: openStartModal }] = useDisclosure(false);
  const fastingPhase = fasting?.phase ?? "early";
  const phaseAccent = FASTING_PHASE_ACCENT[fastingPhase];

  function onEndFasting() {
    modals.openConfirmModal({
      cancelProps: {
        className:
          "border-bd bg-inset text-tx transition hover:bg-panel-2 hover:brightness-110 active:brightness-95",
      },
      centered: true,
      children: (
        <Text size="sm">断食を終了して食事を開始します。ここまでの経過時間が記録されます。</Text>
      ),
      confirmProps: { style: ACCENT_SOLID_STYLE.good },
      labels: { cancel: "キャンセル", confirm: "食事開始(断食終了)" },
      onConfirm: () => {
        const releaseFlashSuppression = suppressNextFastingFlash?.();

        endFasting.mutate(
          {},
          {
            onError: () => {
              releaseFlashSuppression?.();
            },
          },
        );
      },
      styles: CONFIRM_MODAL_STYLES,
      title: "断食を終了しますか?",
    });
  }

  return (
    <>
      <FastingStartModal
        onClose={closeStartModal}
        onStartAttempt={suppressNextFastingFlash}
        opened={startModalOpened}
      />
      <Group
        ref={fastingFlashRef}
        gap="md"
        wrap="nowrap"
        className={cn("relative min-w-[240px] flex-1", fastingFlashOverride && "lp-flash")}
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
          <Suspense
            fallback={
              <Shimmer loading>
                <Button variant="outline" size="xs" className="border-bd-2 text-tx" disabled>
                  食事開始(断食終了)
                </Button>
              </Shimmer>
            }
          >
            <FastingViewerButton fasting={fasting} onClose={onEndFasting} onOpen={openStartModal} />
          </Suspense>
        </Stack>
      </Group>
    </>
  );
}

type FastingViewerButtonProps = Pick<ReturnType<typeof useDashboardFasting>, "fasting"> & {
  onOpen: UseDisclosureReturnValue[1]["open"];
  onClose: UseDisclosureReturnValue[1]["close"];
};

function FastingViewerButton({ fasting, onOpen, onClose }: FastingViewerButtonProps) {
  const viewer = useDashboardViewer();

  if (viewer.role !== "self") {
    return null;
  }

  return fasting === null ? (
    <Button
      className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
      variant="filled"
      style={ACCENT_SOLID_STYLE.blue}
      size="xs"
      onClick={onOpen}
    >
      断食開始
    </Button>
  ) : (
    <Button
      variant="outline"
      size="xs"
      className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
      onClick={onClose}
    >
      食事開始(断食終了)
    </Button>
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
                6:42:00
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
            経過 6:42:00 · 残 9:18:00
          </Text>
        </Stack>
      </Group>
    </Shimmer>
  );
}
