import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import { Suspense } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { GlowCard } from "~/components/glow-card";
import { DeclarationCard } from "~/features/dashboard/components/declaration-card";
import { FastingGroup, FastingGroupFallback } from "~/features/dashboard/components/fasting-group";
import { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
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

const INTERRUPTION_REASONS = [
  "work",
  "dog",
  "chore",
  "other",
] as const satisfies readonly InterruptionReason[];

export function SessionFastingCard({ sessionFlash }: Record<"sessionFlash", boolean>) {
  return (
    <GlowCard
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
          <Suspense fallback={<SelfBadgeFallback />}>
            <SelfBadge />
          </Suspense>
        </Group>
        <Text size="xs" c="dimmed">
          study session
        </Text>
      </Group>
      <Suspense fallback={<SessionStatusGroupFallback />}>
        <SessionStatusGroup
          fastingFlash={false}
          onCompleteSession={() => {}}
          onPauseSession={() => {}}
          onResumeSession={() => {}}
          onStartSession={() => {}}
        />
      </Suspense>
    </GlowCard>
  );
}

function SelfBadge() {
  const viewer = useDashboardViewer();

  if (viewer.role !== "self") {
    return null;
  }

  return (
    <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
      YOU
    </Badge>
  );
}

function SelfBadgeFallback() {
  return (
    <Shimmer loading>
      <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
        YOU
      </Badge>
    </Shimmer>
  );
}

type SessionStatusGroupProps = {
  fastingFlash: boolean;
  onCompleteSession: () => void;
  onPauseSession: (reason: InterruptionReason) => void;
  onResumeSession: () => void;
  onStartSession: () => void;
};

function SessionStatusGroup({
  fastingFlash,
  onCompleteSession,
  onPauseSession,
  onResumeSession,
  onStartSession,
}: SessionStatusGroupProps) {
  const {
    declarationActualMinutes,
    declarationActualPercent,
    declarations,
    declarationTotalMinutes,
    session,
    sessionElapsedLabel,
    sessionGoalLabel,
    sessionProgressPercent,
  } = useDashboardStudy();

  const sessionStatus = session === null ? "idle" : session.status;
  const [statusAccent, statusLabel] = SESSION_STATUS_ACCENT[sessionStatus];

  return (
    <>
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
            className="lp-brandtext leading-none tabular-nums"
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
                type="button"
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
        <Suspense fallback={<FastingGroupFallback />}>
          <FastingGroup fastingFlash={fastingFlash} />
        </Suspense>

        <DeclarationCard
          actualMinutes={declarationActualMinutes}
          actualPercent={declarationActualPercent}
          declarations={declarations}
          totalMinutes={declarationTotalMinutes}
        />
      </Group>
    </>
  );
}

function SessionStatusGroupFallback() {
  return (
    <Shimmer loading>
      <Group align="flex-end" gap={16} wrap="wrap">
        <Stack gap={6}>
          <Group gap={9} align="center">
            <Badge
              variant="outline"
              size="sm"
              className={cn(
                ACCENT_CLASSES.good.border,
                ACCENT_CLASSES.good.bg,
                ACCENT_CLASSES.good.text,
                "border",
              )}
            >
              勉強中
            </Badge>
            <Text size="sm" c="dimmed">
              TOEIC
            </Text>
          </Group>
          <Text
            fw={600}
            className="lp-brandtext leading-none tabular-nums"
            style={{ fontSize: "clamp(2.5rem,7vw,3.9rem)" }}
          >
            00:42:00
          </Text>
        </Stack>
        <Stack gap={3}>
          <Text size="xs" c="dimmed">
            目標 60分
          </Text>
          <Text size="xs" c="dimmed">
            中断 0 回
          </Text>
        </Stack>
      </Group>

      <Progress value={42} color={ACCENT_VARS.good} size="sm" mt="md" />

      <Group wrap="wrap" gap={8} mt="md" align="center">
        <Button disabled variant="filled" style={ACCENT_SOLID_STYLE.good} size="sm">
          完了して記録
        </Button>
        <Text size="xs" c={ACCENT_VARS.faint}>
          中断:
        </Text>
        {INTERRUPTION_REASONS.map((reason) => (
          <Box
            key={reason}
            className={cn(
              ACCENT_CLASSES.amber.border,
              "bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-semibold",
            )}
          >
            {REASON_LABELS[reason]}
          </Box>
        ))}
      </Group>

      <Divider my="lg" className="border-bd" />

      <Group wrap="wrap" gap="xl" align="stretch">
        <FastingGroupFallback />
        <Box className="flex min-w-0 flex-1 flex-col gap-2">
          <Group justify="space-between" align="baseline">
            <Text
              size="10.5px"
              fw={600}
              tt="uppercase"
              c={ACCENT_VARS.faint}
              style={{ letterSpacing: "0.13em" }}
            >
              今日の学習
            </Text>
            <Text size="xs" c="dimmed">
              宣言 vs 実績
            </Text>
          </Group>
          <Group gap={8} align="baseline">
            <Text className="lp-brandtext" size="26px" fw={600}>
              30
            </Text>
            <Text size="sm" c="dimmed">
              / 60 分
            </Text>
          </Group>
          <Progress
            value={50}
            color={ACCENT_VARS.good}
            size="sm"
            className="rounded-md"
            style={{ background: "var(--inset)" }}
          />
        </Box>
      </Group>
    </Shimmer>
  );
}

export function SessionFastingCardFallback() {
  return (
    <Shimmer loading>
      <Paper
        radius={18}
        p="lg"
        className="bg-panel border-bd shadow-card relative overflow-hidden border"
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
            <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
              YOU
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            study session
          </Text>
        </Group>
        <SessionStatusGroupFallback />
      </Paper>
    </Shimmer>
  );
}
