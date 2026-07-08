import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import { Suspense, type ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { INTERRUPTION_REASON_VALUES } from "~/../convex/lib/domain";
import { DeclarationCard } from "~/features/dashboard/components/declaration-card";
import { FastingGroup, FastingGroupFallback } from "~/features/dashboard/components/fasting-group";
import { SessionStartModal } from "~/features/dashboard/components/session-start-modal";
import { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  type InterruptionReason,
  type SessionCategory,
} from "~/types/dashboard";

const SESSION_STATUS_ACCENT = {
  abandoned: "faint",
  active: "good",
  completed: "faint",
  idle: "faint",
  paused: "amber",
} as const satisfies Record<"idle" | Doc<"studySessions">["status"], keyof typeof ACCENT_VARS>;

const INTERRUPTION_REASONS = INTERRUPTION_REASON_VALUES;

const TOOLTIP_STYLES = {
  tooltip: {
    backgroundColor: "var(--panel2)",
    border: "1px solid var(--bd2)",
    color: "var(--tx)",
    fontSize: "11px",
  },
} as const satisfies ComponentProps<typeof Tooltip>["styles"];

function categoryLabel(category: SessionCategory) {
  switch (category) {
    case "eikaiwa":
      return "英会話";

    case "other":
      return "その他";

    case "reading":
      return "読書";

    case "toeic":
      return "TOEIC";
  }
}

function reasonLabel(reason: InterruptionReason) {
  switch (reason) {
    case "chore":
      return "家事";
    case "dog":
      return "犬";
    case "other":
      return "その他";
    case "work":
      return "仕事";
  }
}

function reasonTooltip(reason: InterruptionReason) {
  switch (reason) {
    case "chore":
      return "家事の割り込みを中断理由として記録";
    case "dog":
      return "犬の世話を中断理由として記録";
    case "other":
      return "その他の理由を中断理由として記録";
    case "work":
      return "仕事の割り込みを中断理由として記録";
  }
}

function sessionStatusLabel(status: "idle" | Doc<"studySessions">["status"]) {
  switch (status) {
    case "abandoned":
      return "放置終了";
    case "active":
      return "勉強中";
    case "completed":
      return "完了";
    case "idle":
      return "待機";
    case "paused":
      return "中断中";
  }
}

export function SessionStatusGroup({
  fastingFlash,
}: Partial<Record<"fastingFlash", boolean>> = {}) {
  const {
    declarationActualMinutes,
    declarationActualPercent,
    declarations,
    declarationTotalMinutes,
    onCompleteSession,
    onPauseSession,
    onResumeSession,
    onStartSession,
    session,
    sessionElapsedLabel,
    sessionFlashRef,
    sessionGoalLabel,
    sessionProgressPercent,
  } = useDashboardStudy();

  const [startModalOpened, { close: closeStartModal, open: openStartModal }] = useDisclosure(false);

  const sessionStatus = session === null ? "idle" : session.status;
  const statusAccent = SESSION_STATUS_ACCENT[sessionStatus];

  return (
    <Box ref={sessionFlashRef} className="relative">
      <SessionStartModal
        opened={startModalOpened}
        onClose={closeStartModal}
        onStart={onStartSession}
      />
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
              {sessionStatusLabel(sessionStatus)}
            </Badge>
            {session !== null && (
              <Text size="sm" c="dimmed">
                {categoryLabel(session.category as SessionCategory)}
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

      <Group wrap="wrap" gap={8} mt="md" align="center">
        {sessionStatus === "active" && (
          <>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
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
              <Tooltip key={reason} label={reasonTooltip(reason)} styles={TOOLTIP_STYLES}>
                <UnstyledButton
                  type="button"
                  onClick={() => onPauseSession(reason)}
                  className={cn(
                    ACCENT_CLASSES.amber.border,
                    "bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:brightness-110 active:brightness-95 disabled:opacity-40",
                  )}
                >
                  {reasonLabel(reason)}
                </UnstyledButton>
              </Tooltip>
            ))}
          </>
        )}
        {sessionStatus === "paused" && (
          <>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              variant="filled"
              style={ACCENT_SOLID_STYLE.good}
              size="sm"
              onClick={onResumeSession}
            >
              再開
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
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
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              variant="filled"
              style={ACCENT_SOLID_STYLE.good}
              size="sm"
              onClick={openStartModal}
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
    </Box>
  );
}

export function SessionStatusGroupFallback() {
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
            {reasonLabel(reason)}
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
