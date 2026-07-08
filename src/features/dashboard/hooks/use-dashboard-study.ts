import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConvexError } from "convex/values";

import { dashboardStudyQuery } from "~/features/dashboard/api/dashboard-study-query";
import type { Id } from "~/../convex/_generated/dataModel";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useCompleteSession } from "~/features/dashboard/hooks/use-complete-session";
import { usePauseSession } from "~/features/dashboard/hooks/use-pause-session";
import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";
import { useResumeSession } from "~/features/dashboard/hooks/use-resume-session";
import { useStartSession } from "~/features/dashboard/hooks/use-start-session";
import {
  deriveSessionElapsedMs,
  formatElapsedClock,
  toDeclarationItems,
} from "~/features/dashboard/utils/format";
import type { InterruptionReason } from "~/types/dashboard";

const MINUTE_MS = 60_000;

// Session mutations reject with a ConvexError whose `data` is one of these codes
// (see convex/services/sessions/*.ts). Only SESSION_EXISTS gets a tailored
// message — every other guard is a rare race the user can just retry.
const SESSION_ERROR_MESSAGES = {
  SESSION_EXISTS: "進行中のセッションがあります",
} as const;

function sessionErrorMessage(cause: unknown, fallback: string) {
  if (
    cause instanceof ConvexError &&
    typeof cause.data === "string" &&
    cause.data in SESSION_ERROR_MESSAGES
  ) {
    return SESSION_ERROR_MESSAGES[cause.data as keyof typeof SESSION_ERROR_MESSAGES];
  }

  return fallback;
}

export function useDashboardStudy() {
  const { dateJst, nowMs } = useBoardClock();
  const study = useSuspenseQuery(dashboardStudyQuery(dateJst)).data;
  const startSession = useStartSession();
  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const completeSession = useCompleteSession();

  const declarations = toDeclarationItems(study.blocks);
  const sessionElapsedMs = deriveSessionElapsedMs(study.session, nowMs);
  const goalMinutes = study.session?.plannedMinutes ?? 0;
  const declarationTotalMinutes = declarations.reduce((sum, item) => sum + item.plannedMinutes, 0);
  const inProgressMinutes =
    study.session !== null &&
    (study.session.status === "active" || study.session.status === "paused")
      ? Math.round(sessionElapsedMs / MINUTE_MS)
      : 0;
  const declarationActualMinutes = study.todayActualMinutes + inProgressMinutes;
  const sessionFingerprint =
    study.session === null
      ? "none"
      : [
          study.session._id,
          study.session.status,
          study.session.categoryId,
          study.session.startedAt,
          study.session.lastResumedAt ?? "",
          study.session.accumulatedMs,
          study.session.interruptionCount,
          study.session.plannedMinutes ?? "",
        ].join("|");
  const { flashRef: sessionFlashRef, suppressNextFlash } = useRemoteUpdateFlash(sessionFingerprint);

  function onStartSession(categoryId: Id<"studyCategories">, plannedMinutes?: number) {
    const releaseFlashSuppression = suppressNextFlash();

    startSession.mutate(
      { categoryId, dateJst, plannedMinutes },
      {
        onError: (error) => {
          releaseFlashSuppression();
          notifications.show({
            color: "red",
            message: sessionErrorMessage(error, "開始に失敗しました"),
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "セッションを開始しました",
            title: "開始しました",
          });
        },
      },
    );
  }

  function onPauseSession(reason: InterruptionReason) {
    const releaseFlashSuppression = suppressNextFlash();

    pauseSession.mutate(
      { reason },
      {
        onError: (error) => {
          releaseFlashSuppression();
          notifications.show({
            color: "red",
            message: sessionErrorMessage(error, "中断に失敗しました"),
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "セッションを中断しました",
            title: "中断しました",
          });
        },
      },
    );
  }

  function onResumeSession() {
    const releaseFlashSuppression = suppressNextFlash();

    resumeSession.mutate(
      {},
      {
        onError: (error) => {
          releaseFlashSuppression();
          notifications.show({
            color: "red",
            message: sessionErrorMessage(error, "再開に失敗しました"),
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "セッションを再開しました",
            title: "再開しました",
          });
        },
      },
    );
  }

  function onCompleteSession() {
    const releaseFlashSuppression = suppressNextFlash();

    completeSession.mutate(
      {},
      {
        onError: (error) => {
          releaseFlashSuppression();
          notifications.show({
            color: "red",
            message: sessionErrorMessage(error, "完了に失敗しました"),
            title: "エラー",
          });
        },
        onSuccess: () => {
          notifications.show({
            color: "green",
            message: "セッションを完了しました",
            title: "完了しました",
          });
        },
      },
    );
  }

  return {
    declarationActualMinutes,
    declarationActualPercent:
      declarationTotalMinutes > 0
        ? Math.min(100, Math.round((declarationActualMinutes / declarationTotalMinutes) * 100))
        : 0,
    declarationTotalMinutes,
    declarations,
    onCompleteSession,
    onPauseSession,
    onResumeSession,
    onStartSession,
    session: study.session,
    sessionElapsedMs,
    sessionElapsedLabel: formatElapsedClock(sessionElapsedMs),
    sessionFlashRef,
    sessionGoalLabel: `${goalMinutes}分`,
    sessionProgressPercent:
      goalMinutes > 0
        ? Math.min(100, Math.round((sessionElapsedMs / MINUTE_MS / goalMinutes) * 100))
        : 0,
  } as const;
}
