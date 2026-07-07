import { Badge, Button, Group, Progress, Stack, Text, Timeline } from "@mantine/core";
import { useDisclosure, type UseDisclosureReturnValue } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import { Suspense } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useViewer } from "~/features/auth/hooks/use-viewer";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { formatElapsedClock } from "~/features/dashboard/utils/format";
import { FastingStartModal } from "~/features/fasting/components/fasting-start-modal";
import { useEndFasting } from "~/features/fasting/hooks/use-end-fasting";
import { useFastingWindow } from "~/features/fasting/hooks/use-fasting-window";
import { deriveFastingElapsedMinutes } from "~/features/fasting/utils/fasting-utils";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  FASTING_PHASE_LABELS,
  FASTING_PHASE_SUB_LABELS,
} from "~/types/dashboard";

// Matches the default applied server-side (services/appSettings/getFastingDefaultMinutes.ts)
// when neither an active window's targetMinutes nor an appSettings override is available.
const DEFAULT_FASTING_TARGET_MINUTES = 960;

const PHASE_ORDER = [
  "early",
  "fatburn",
  "goal",
] as const satisfies readonly Doc<"fastingWindows">["phase"][];

// Single consumer: maps fasting phase to its accent key for the timeline/progress bar,
// matching the assignment used on the live board (dashboard/components/fasting-group.tsx).
const FASTING_PHASE_ACCENT = {
  early: "blue",
  fatburn: "amber",
  goal: "good",
} as const satisfies Record<Doc<"fastingWindows">["phase"], keyof typeof ACCENT_VARS>;

const CONFIRM_MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const;

function formatMinutesAsHm(rawMinutes: number) {
  const minutes = Math.max(0, Math.round(rawMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h${String(remainder).padStart(2, "0")}m` : `${remainder}m`;
}

export function FastingStatusCard() {
  const { data: fasting } = useFastingWindow();
  const { nowMs } = useBoardClock();
  const endFasting = useEndFasting();
  const [startModalOpened, { close: closeStartModal, open: openStartModal }] = useDisclosure(false);

  const phase = fasting?.phase ?? "early";
  const phaseAccent = FASTING_PHASE_ACCENT[phase];
  const currentPhaseIndex = fasting === null ? -1 : PHASE_ORDER.indexOf(fasting.phase);
  const targetMinutes = fasting?.targetMinutes ?? DEFAULT_FASTING_TARGET_MINUTES;
  const elapsedMinutes =
    fasting === null ? 0 : deriveFastingElapsedMinutes(fasting.startedAt, nowMs);
  const remainMinutes = Math.max(0, targetMinutes - elapsedMinutes);
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));

  function onEndFasting() {
    modals.openConfirmModal({
      cancelProps: { className: "border-bd bg-inset text-tx hover:bg-panel-2" },
      centered: true,
      children: (
        <Text size="sm">断食を終了して食事を開始します。ここまでの経過時間が記録されます。</Text>
      ),
      confirmProps: { style: ACCENT_SOLID_STYLE.good },
      labels: { cancel: "キャンセル", confirm: "食事開始(断食終了)" },
      onConfirm: () => {
        endFasting.mutate({});
      },
      styles: CONFIRM_MODAL_STYLES,
      title: "断食を終了しますか?",
    });
  }

  return (
    <>
      <FastingStartModal onClose={closeStartModal} opened={startModalOpened} />
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={6}>
            <Badge
              className={cn(
                ACCENT_CLASSES[phaseAccent].border,
                ACCENT_CLASSES[phaseAccent].bg,
                ACCENT_CLASSES[phaseAccent].text,
                "border",
              )}
              size="sm"
              variant="outline"
            >
              {fasting === null ? "未開始" : FASTING_PHASE_LABELS[phase]}
            </Badge>
            <Text
              className="lp-brandtext leading-none tabular-nums"
              fw={600}
              style={{ fontSize: "clamp(2.5rem,6vw,3.4rem)" }}
            >
              {formatElapsedClock(elapsedMinutes * 60_000)}
            </Text>
            <Text c="dimmed" size="xs">
              残り{" "}
              <Text c="var(--tx)" component="span" size="xs">
                {formatMinutesAsHm(remainMinutes)}
              </Text>{" "}
              · 目標{" "}
              <Text c="var(--tx)" component="span" size="xs">
                {formatMinutesAsHm(targetMinutes)}
              </Text>
            </Text>
          </Stack>

          <Suspense
            fallback={
              <Shimmer loading>
                <Button disabled style={ACCENT_SOLID_STYLE.blue} variant="filled">
                  断食開始
                </Button>
              </Shimmer>
            }
          >
            <FastingStatusCardButton
              data={fasting}
              onOpen={openStartModal}
              onClose={onEndFasting}
            />
          </Suspense>
        </Group>

        <Progress color={ACCENT_VARS[phaseAccent]} size="sm" value={progressPercent} />

        <Timeline
          active={currentPhaseIndex}
          bulletSize={22}
          color={ACCENT_VARS[phaseAccent]}
          lineWidth={2}
        >
          {PHASE_ORDER.map((timelinePhase) => (
            <Timeline.Item
              key={timelinePhase}
              title={
                <Text c="var(--tx)" fw={600} size="sm">
                  {FASTING_PHASE_LABELS[timelinePhase]}
                </Text>
              }
            >
              <Text c="dimmed" size="xs">
                {FASTING_PHASE_SUB_LABELS[timelinePhase]}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Stack>
    </>
  );
}

type FastingStatusCardButtonProps = Pick<ReturnType<typeof useFastingWindow>, "data"> & {
  onOpen: UseDisclosureReturnValue[1]["open"];
  onClose: UseDisclosureReturnValue[1]["close"];
};

function FastingStatusCardButton({ data, onOpen, onClose }: FastingStatusCardButtonProps) {
  const { data: viewer } = useViewer();

  if (viewer?.role !== "self") {
    return null;
  }

  return data === null ? (
    <Button onClick={onOpen} style={ACCENT_SOLID_STYLE.blue} variant="filled">
      断食開始
    </Button>
  ) : (
    <Button className="border-bd-2 text-tx" onClick={onClose} variant="outline">
      食事開始(断食終了)
    </Button>
  );
}

export function FastingStatusCardFallback() {
  return (
    <Shimmer loading>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={6}>
            <Badge
              className={cn(
                ACCENT_CLASSES.blue.border,
                ACCENT_CLASSES.blue.bg,
                ACCENT_CLASSES.blue.text,
                "border",
              )}
              size="sm"
              variant="outline"
            >
              空腹期
            </Badge>
            <Text
              className="lp-brandtext leading-none tabular-nums"
              fw={600}
              style={{ fontSize: "clamp(2.5rem,6vw,3.4rem)" }}
            >
              6:42:00
            </Text>
            <Text c="dimmed" size="xs">
              残り{" "}
              <Text c="var(--tx)" component="span" size="xs">
                9h18m
              </Text>{" "}
              · 目標{" "}
              <Text c="var(--tx)" component="span" size="xs">
                16h00m
              </Text>
            </Text>
          </Stack>
          <Button disabled style={ACCENT_SOLID_STYLE.blue} variant="filled">
            断食開始
          </Button>
        </Group>

        <Progress color={ACCENT_VARS.blue} size="sm" value={42} />

        <Timeline active={0} bulletSize={22} color={ACCENT_VARS.blue} lineWidth={2}>
          {PHASE_ORDER.map((timelinePhase) => (
            <Timeline.Item
              key={timelinePhase}
              title={
                <Text c="var(--tx)" fw={600} size="sm">
                  {FASTING_PHASE_LABELS[timelinePhase]}
                </Text>
              }
            >
              <Text c="dimmed" size="xs">
                {FASTING_PHASE_SUB_LABELS[timelinePhase]}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Stack>
    </Shimmer>
  );
}
