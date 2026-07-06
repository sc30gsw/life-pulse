import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  dashboardDogQuery,
  dashboardFastingQuery,
  dashboardHealthQuery,
  dashboardPresenceQuery,
  dashboardStudyQuery,
  dashboardViewerQuery,
} from "~/features/dashboard/api/dashboard-live-query";
import { useLogDogEvent } from "~/features/dashboard/hooks/use-log-dog-event";
import { useSetPresence } from "~/features/dashboard/hooks/use-set-presence";
import { useUndoDogEvent } from "~/features/dashboard/hooks/use-undo-dog-event";
import {
  DOG_EVENT_LABELS,
  type BoardToast,
  type DogEventKind,
  type PresenceState,
  type ThemeMode,
  type ToastAccent,
} from "~/features/dashboard/types/dashboard";
import {
  deriveFastingElapsedMinutes,
  deriveSessionElapsedMs,
  formatClockDate,
  formatClockTime,
  formatElapsedClock,
  formatMinutesAsHm,
  formatRelativeTime,
  toDeclarationItems,
  toDogCareItems,
} from "~/features/dashboard/utils/format";
import { toDateJst, todayJst } from "~/utils/date-jst";

const MINUTE_MS = 60_000;
const CLOCK_TICK_MS = 1_000;
const TOAST_LIFETIME_MS = 4_200;
const MAX_TOASTS = 4;
const DEFAULT_FASTING_TARGET_MINUTES = 960;

export function useLiveBoard() {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dateJst, setDateJst] = useState(() => todayJst());
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [toasts, setToasts] = useState<BoardToast[]>([]);

  const toastIdRef = useRef(0);
  // Lazily-initialized (not useRef(new Map()), which rebuilds and discards a Map every render).
  const toastTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>> | null>(null);

  function getToastTimers() {
    toastTimersRef.current ??= new Map();
    return toastTimersRef.current;
  }

  function pushToast(text: string, accent: ToastAccent, who: string) {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { accent, id, text, who }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      getToastTimers().delete(id);
    }, TOAST_LIFETIME_MS);
    getToastTimers().set(id, timer);
  }

  useEffect(() => {
    return () => {
      for (const timer of getToastTimers().values()) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 1s clock tick, also detects a JST day rollover and re-points card queries
  // at the new date. Data stays card-scoped; this hook only owns the shared key.
  useEffect(() => {
    const id = setInterval(() => {
      const tickNow = Date.now();
      setNowMs(tickNow);
      const tickDateJst = toDateJst(tickNow);
      setDateJst((prev) => (prev === tickDateJst ? prev : tickDateJst));
    }, CLOCK_TICK_MS);

    return () => {
      clearInterval(id);
    };
  }, []);

  const { data: viewer } = useSuspenseQuery(dashboardViewerQuery());
  const { data: study } = useSuspenseQuery(dashboardStudyQuery(dateJst));
  const { data: fasting } = useSuspenseQuery(dashboardFastingQuery());
  const { data: health } = useSuspenseQuery(dashboardHealthQuery(dateJst));
  const { data: dog } = useSuspenseQuery(dashboardDogQuery(dateJst));
  const { data: partnerPresence } = useSuspenseQuery(dashboardPresenceQuery());

  const logDogEvent = useLogDogEvent();
  const undoDogEvent = useUndoDogEvent();
  const setPresence = useSetPresence();

  const declarations = toDeclarationItems(study.blocks);
  const dogCare = toDogCareItems(dog.events);

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function onToggleDogCare(kind: DogEventKind) {
    const current = dogCare.find((item) => item.kind === kind);

    if (current === undefined) {
      return;
    }

    if (!current.done) {
      logDogEvent.mutate(
        { dateJst, kind },
        {
          onError: () => {
            notifications.show({ color: "red", message: "記録に失敗しました", title: "エラー" });
          },
          onSuccess: () => {
            pushToast(`${dog.dogName}の${DOG_EVENT_LABELS[kind]} ✓ 記録`, "coral", "自分の操作");
          },
        },
      );

      return;
    }

    const loggedEvent = dog.events.find((event) => event.kind === kind);
    if (loggedEvent === undefined) {
      return;
    }

    modals.openConfirmModal({
      centered: true,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "取り消す" },
      onConfirm: () => {
        undoDogEvent.mutate(
          { dateJst, eventId: loggedEvent.id },
          {
            onError: () => {
              notifications.show({ color: "red", message: "取消に失敗しました", title: "エラー" });
            },
            onSuccess: () => {
              pushToast(`${dog.dogName}の${DOG_EVENT_LABELS[kind]} 取消`, "faint", "自分の操作");
            },
          },
        );
      },
      title: "記録を取り消しますか?",
    });
  }

  function onSetPresence(state: PresenceState, etaHm?: string) {
    setPresence.mutate(
      { etaHm, state },
      {
        onError: () => {
          notifications.show({ color: "red", message: "更新に失敗しました", title: "エラー" });
        },
        onSuccess: () => {
          pushToast(`パートナー: ${state}`, "blue", "自分の操作");
        },
      },
    );
  }

  const sessionElapsedMs = deriveSessionElapsedMs(study.session, nowMs);
  const fastingTargetMinutes = fasting?.targetMinutes ?? DEFAULT_FASTING_TARGET_MINUTES;
  const fastingElapsedMinutes =
    fasting === null ? 0 : deriveFastingElapsedMinutes(fasting.startedAt, nowMs);

  const declarationTotalMinutes = declarations.reduce((sum, item) => sum + item.plannedMinutes, 0);
  const inProgressMinutes =
    study.session !== null &&
    (study.session.status === "active" || study.session.status === "paused")
      ? Math.round(sessionElapsedMs / MINUTE_MS)
      : 0;
  const declarationActualMinutes = study.todayActualMinutes + inProgressMinutes;

  const goalMinutes = study.session?.plannedMinutes ?? 0;

  return {
    clockDateLabel: formatClockDate(nowMs),
    clockTime: formatClockTime(nowMs),
    dateJst,
    declarationActualMinutes,
    declarationActualPercent:
      declarationTotalMinutes > 0
        ? Math.min(100, Math.round((declarationActualMinutes / declarationTotalMinutes) * 100))
        : 0,
    declarationTotalMinutes,
    declarations,
    dogCare,
    // Flash-on-remote-update (server push detection) is deferred past W1 — see the wiring plan.
    dogFlash: false,
    dogName: dog.dogName,
    fasting,
    fastingElapsedLabel: formatMinutesAsHm(fastingElapsedMinutes),
    fastingFlash: false,
    fastingRemainLabel: formatMinutesAsHm(
      Math.max(0, fastingTargetMinutes - fastingElapsedMinutes),
    ),
    fastingRingPercent: Math.min(
      100,
      Math.round((fastingElapsedMinutes / fastingTargetMinutes) * 100),
    ),
    isPartnerView: viewer.role === "partner",
    isSelfView: viewer.role === "self",
    lastSyncRelativeLabel: health === null ? "未同期" : formatRelativeTime(health.syncedAt, nowMs),
    metrics: health,
    nowMs,
    onSetPresence,
    onToggleDogCare,
    onToggleTheme,
    partner: partnerPresence,
    partnerFlash: false,
    partnerUpdatedRelativeLabel:
      partnerPresence === null ? "未更新" : formatRelativeTime(partnerPresence.updatedAt, nowMs),
    pushToast,
    session: study.session,
    sessionElapsedLabel: formatElapsedClock(sessionElapsedMs),
    sessionFlash: false,
    sessionGoalLabel: `${goalMinutes}分`,
    sessionProgressPercent:
      goalMinutes > 0
        ? Math.min(100, Math.round((sessionElapsedMs / MINUTE_MS / goalMinutes) * 100))
        : 0,
    theme,
    toasts,
  } as const;
}
