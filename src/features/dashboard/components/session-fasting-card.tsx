import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  RingProgress,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { cn } from "cnfast";

import type { Doc } from "~/../convex/_generated/dataModel";
import { DeclarationCard } from "~/features/dashboard/components/declaration-card";
import type { useLiveBoard } from "~/features/dashboard/hooks/use-live-board";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  FASTING_PHASE_LABELS,
  FASTING_PHASE_SUB_LABELS,
  REASON_LABELS,
  type InterruptionReason,
} from "~/features/dashboard/types/dashboard";

// Single consumer: maps session status ("idle" = no session document at all) to its
// accent key + Japanese label for the status pill.
const SESSION_STATUS_ACCENT = {
  abandoned: ["faint", "放置終了"],
  active: ["good", "勉強中"],
  completed: ["faint", "完了"],
  idle: ["faint", "待機"],
  paused: ["amber", "中断中"],
} as const satisfies Record<
  "idle" | Doc<"studySessions">["status"],
  readonly [keyof typeof ACCENT_VARS, string]
>;

// Single consumer: maps fasting phase to its accent key for the ring/labels.
const FASTING_PHASE_ACCENT = {
  early: "blue",
  fatburn: "amber",
  goal: "good",
} as const satisfies Record<Doc<"fastingWindows">["phase"], keyof typeof ACCENT_VARS>;

const INTERRUPTION_REASONS = [
  "work",
  "dog",
  "chore",
  "other",
] as const satisfies readonly InterruptionReason[];

type SessionFastingCardProps = Pick<
  ReturnType<typeof useLiveBoard>,
  | "declarationActualMinutes"
  | "declarationActualPercent"
  | "declarationTotalMinutes"
  | "declarations"
  | "fasting"
  | "fastingElapsedLabel"
  | "fastingFlash"
  | "fastingRemainLabel"
  | "fastingRingPercent"
  | "session"
  | "sessionElapsedLabel"
  | "sessionFlash"
  | "sessionGoalLabel"
  | "sessionProgressPercent"
  | "isSelfView"
> & {
  onCompleteSession: () => void;
  onPauseSession: (reason: InterruptionReason) => void;
  onResumeSession: () => void;
  onStartSession: () => void;
};

export function SessionFastingCard({
  declarationActualMinutes,
  declarationActualPercent,
  declarationTotalMinutes,
  declarations,
  fasting,
  fastingElapsedLabel,
  fastingFlash,
  fastingRemainLabel,
  fastingRingPercent,
  isSelfView,
  onCompleteSession,
  onPauseSession,
  onResumeSession,
  onStartSession,
  session,
  sessionElapsedLabel,
  sessionFlash,
  sessionGoalLabel,
  sessionProgressPercent,
}: SessionFastingCardProps) {
  const sessionStatus = session === null ? "idle" : session.status;
  const [statusAccent, statusLabel] = SESSION_STATUS_ACCENT[sessionStatus];
  const fastingPhase = fasting?.phase ?? "early";
  const phaseAccent = FASTING_PHASE_ACCENT[fastingPhase];

  return (
    <Paper
      radius={18}
      p="lg"
      className={cn(
        "bg-panel border-bd shadow-card relative overflow-hidden border",
        sessionFlash && "lp-flash",
      )}
    >
      <Group justify="space-between" mb="md">
        <Group gap={10}>
          <Text
            size="11px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.14em" }}
          >
            本人 · 発注者
          </Text>
          {isSelfView && (
            <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
              YOU
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          study session
        </Text>
      </Group>

      <Group align="flex-end" gap={16} wrap="wrap">
        <Stack gap={6}>
          <Group gap={9} align="center">
            <Badge
              variant="outline"
              size="sm"
              className={cn(
                ACCENT_CLASSES[statusAccent].border,
                ACCENT_CLASSES[statusAccent].bg,
                ACCENT_CLASSES[statusAccent].text,
                "border",
              )}
            >
              {statusLabel}
            </Badge>
            {session !== null && (
              <Text size="sm" c="dimmed">
                {CATEGORY_LABELS[session.category]}
              </Text>
            )}
          </Group>
          <Text
            fw={600}
            className="leading-none tabular-nums"
            style={{ fontSize: "clamp(2.5rem,7vw,3.9rem)" }}
          >
            {sessionElapsedLabel}
          </Text>
        </Stack>
        <Stack gap={3}>
          <Text size="xs" c="dimmed">
            目標{" "}
            <Text component="span" size="xs" c="var(--tx)">
              {sessionGoalLabel}
            </Text>
          </Text>
          <Text size="xs" c="dimmed">
            中断{" "}
            <Text component="span" size="xs" c="var(--tx)">
              {session?.interruptionCount ?? 0}
            </Text>{" "}
            回
          </Text>
        </Stack>
      </Group>

      <Progress value={sessionProgressPercent} color={ACCENT_VARS.good} size="sm" mt="md" />

      {/* Session controls are disabled in W1 — start/pause/resume/complete mutations
          land in W2 (docs/plans/2026-07-07-live-board-wiring.md, out of scope here). */}
      <Group wrap="wrap" gap={8} mt="md" align="center">
        {sessionStatus === "active" && (
          <>
            <Button
              disabled
              variant="filled"
              style={ACCENT_SOLID_STYLE.good}
              size="sm"
              onClick={onCompleteSession}
            >
              完了して記録
            </Button>
            <Text size="xs" c={ACCENT_VARS.faint}>
              中断:
            </Text>
            {INTERRUPTION_REASONS.map((reason) => (
              <UnstyledButton
                key={reason}
                disabled
                onClick={() => onPauseSession(reason)}
                className={cn(
                  ACCENT_CLASSES.amber.border,
                  "bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
                )}
              >
                {REASON_LABELS[reason]}
              </UnstyledButton>
            ))}
          </>
        )}
        {sessionStatus === "paused" && (
          <>
            <Button
              disabled
              variant="filled"
              style={ACCENT_SOLID_STYLE.good}
              size="sm"
              onClick={onResumeSession}
            >
              再開
            </Button>
            <Button
              disabled
              variant="outline"
              size="sm"
              className="border-bd-2 text-tx"
              onClick={onCompleteSession}
            >
              完了
            </Button>
          </>
        )}
        {(sessionStatus === "idle" ||
          sessionStatus === "completed" ||
          sessionStatus === "abandoned") && (
          <>
            <Button
              disabled
              variant="filled"
              style={ACCENT_SOLID_STYLE.good}
              size="sm"
              onClick={onStartSession}
            >
              セッション開始
            </Button>
            <Text size="xs" c={ACCENT_VARS.faint}>
              アクティブは同時に1つ
            </Text>
          </>
        )}
      </Group>

      <Divider my="lg" className="border-bd" />

      <Group wrap="wrap" gap="xl" align="stretch">
        <Group
          gap="md"
          wrap="nowrap"
          className={cn("relative min-w-[240px] flex-1", fastingFlash && "lp-flash")}
        >
          <RingProgress
            size={96}
            thickness={8}
            sections={[{ value: fastingRingPercent, color: ACCENT_VARS[phaseAccent] }]}
            label={
              <Stack gap={1} align="center">
                <Text fw={600} size="lg" c={ACCENT_VARS[phaseAccent]}>
                  {fastingElapsedLabel}
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

        <DeclarationCard
          actualMinutes={declarationActualMinutes}
          actualPercent={declarationActualPercent}
          declarations={declarations}
          totalMinutes={declarationTotalMinutes}
        />
      </Group>
    </Paper>
  );
}
