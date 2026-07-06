// TEMPORARY demo layer — replaces the design file's mock JS with React local state.
// Will be deleted when Convex subscriptions land (docs/spec.md §5/§6). Do not extend.
import { useEffect, useRef, useState } from "react";

import { resolveDashboardFixture } from "~/features/dashboard/fixtures/dashboard-fixture";
import {
  CATEGORY_LABELS,
  DOG_EVENT_LABELS,
  PRESENCE_LABELS,
  REASON_LABELS,
  type BoardToast,
  type DashboardFixture,
  type DogEventKind,
  type FastingPhase,
  type HealthMetrics,
  type InterruptionReason,
  type Perspective,
  type PresenceState,
  type SessionState,
  type ThemeMode,
  type ToastAccent,
} from "~/features/dashboard/types/dashboard";

const MINUTE_MS = 60_000;
const FATBURN_THRESHOLD_MINUTES = 12 * 60;
const CLOCK_TICK_MS = 1_000;
const DEMO_TICK_MS = 5_000;
const FLASH_DURATION_MS = 950;
const TOAST_LIFETIME_MS = 4_200;
const MAX_TOASTS = 4;

const PRESENCE_CYCLE = [
  "home",
  "office",
  "commuting_home",
  "out",
  "sleeping",
] as const satisfies PresenceState[];

type FlashKey = "session" | "fasting" | "partner" | "dog";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatElapsedClock(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

function formatMinutesAsHm(rawMinutes: number) {
  const minutes = Math.max(0, Math.round(rawMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h${pad(remainder)}m` : `${remainder}m`;
}

function formatRelativeTime(pastMs: number, nowMs: number) {
  const deltaSeconds = Math.floor((nowMs - pastMs) / 1000);
  if (deltaSeconds < 8) return "たった今";
  if (deltaSeconds < 60) return `${deltaSeconds}秒前`;
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}分前`;
  if (deltaSeconds < 86_400) return `${Math.floor(deltaSeconds / 3600)}時間前`;
  return `${Math.floor(deltaSeconds / 86_400)}日前`;
}

function formatClockTime(nowMs: number) {
  return new Date(nowMs).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

function formatClockDate(nowMs: number) {
  return new Date(nowMs).toLocaleDateString("ja-JP", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tokyo",
    weekday: "short",
  });
}

function formatPresence(state: PresenceState) {
  return state === "commuting_home"
    ? `${PRESENCE_LABELS[state]} · ETA 20:30`
    : PRESENCE_LABELS[state];
}

function deriveSessionElapsedMs(session: SessionState, nowMs: number) {
  if (session.status !== "active") return session.accumulatedMs;
  return session.accumulatedMs + Math.max(0, nowMs - session.lastResumedAt);
}

function deriveFastingElapsedMinutes(fastingStartedAt: number, nowMs: number) {
  return Math.max(0, (nowMs - fastingStartedAt) / MINUTE_MS);
}

function deriveFastingPhase(elapsedMinutes: number, targetMinutes: number): FastingPhase {
  if (elapsedMinutes >= targetMinutes) return "goal";
  if (elapsedMinutes >= FATBURN_THRESHOLD_MINUTES) return "fatburn";
  return "early";
}

function jitter(value: number, spread: number, rand: () => number) {
  return value + Math.round((rand() - 0.5) * spread);
}

function nextDemoMetric(prev: HealthMetrics, rand: () => number): HealthMetrics {
  return {
    ...prev,
    bodyBattery: Math.min(99, Math.max(30, jitter(prev.bodyBattery, 8, rand))),
    hrv: Math.min(90, Math.max(35, jitter(prev.hrv, 8, rand))),
    source: "demo",
    steps: prev.steps + Math.max(0, Math.round(rand() * 180)),
  };
}

export type UseDemoBoardResult = {
  clockDateLabel: string;
  clockTime: string;
  declarationActualMinutes: number;
  declarationActualPercent: number;
  declarationTotalMinutes: number;
  dogFlash: boolean;
  fasting: DashboardFixture["fasting"];
  fastingElapsedLabel: string;
  fastingFlash: boolean;
  fastingRemainLabel: string;
  fastingRingPercent: number;
  fixture: DashboardFixture;
  isDemoRunning: boolean;
  lastSyncRelativeLabel: string;
  onCompleteSession: () => void;
  onPauseSession: (reason: InterruptionReason) => void;
  onResumeSession: () => void;
  onSetPartnerPresence: (state: PresenceState) => void;
  onSetPerspective: (perspective: Perspective) => void;
  onStartSession: () => void;
  onToggleDemo: () => void;
  onToggleDogCare: (kind: DogEventKind) => void;
  onToggleTheme: () => void;
  partnerFlash: boolean;
  partnerUpdatedRelativeLabel: string;
  perspective: Perspective;
  sessionElapsedLabel: string;
  sessionFlash: boolean;
  sessionGoalLabel: string;
  sessionProgressPercent: number;
  theme: ThemeMode;
  toasts: BoardToast[];
};

export function useDemoBoard(): UseDemoBoardResult {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [fixture, setFixture] = useState<DashboardFixture>(() =>
    resolveDashboardFixture(Date.now()),
  );
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [perspective, setPerspective] = useState<Perspective>("self");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [toasts, setToasts] = useState<BoardToast[]>([]);
  const [flash, setFlash] = useState<Record<FlashKey, boolean>>({
    dog: false,
    fasting: false,
    partner: false,
    session: false,
  });

  const toastIdRef = useRef(0);
  // Lazily-initialized (not useRef(new Map()), which rebuilds and discards a Map every render).
  const toastTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>> | null>(null);
  const flashTimersRef = useRef<Map<FlashKey, ReturnType<typeof setTimeout>> | null>(null);
  // Mirrors `fixture` for the two interval effects below, so they can read the latest value
  // without depending on `fixture` (which would tear down and recreate the interval on every tick).
  const fixtureRef = useRef(fixture);
  fixtureRef.current = fixture;

  function getToastTimers() {
    toastTimersRef.current ??= new Map();
    return toastTimersRef.current;
  }

  function getFlashTimers() {
    flashTimersRef.current ??= new Map();
    return flashTimersRef.current;
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function pushToast(text: string, accent: ToastAccent, who: string) {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { accent, id, text, who }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      getToastTimers().delete(id);
    }, TOAST_LIFETIME_MS);
    getToastTimers().set(id, timer);
  }

  function triggerFlash(key: FlashKey) {
    const existing = getFlashTimers().get(key);
    if (existing) clearTimeout(existing);
    setFlash((prev) => ({ ...prev, [key]: true }));
    const timer = setTimeout(() => {
      setFlash((prev) => ({ ...prev, [key]: false }));
      getFlashTimers().delete(key);
    }, FLASH_DURATION_MS);
    getFlashTimers().set(key, timer);
  }

  const whoLabel = perspective === "self" ? "本人の操作" : "パートナーの操作";

  // 1s clock tick + server-scheduler-style fasting phase advance (docs/spec.md §4.2).
  // Effect runs once: it reads the latest fixture via `fixtureRef` and only calls setFixture
  // with a pure updater — pushToast/triggerFlash (both side effects) run outside of it, since
  // React may invoke a setState updater more than once per commit.
  useEffect(() => {
    const id = setInterval(() => {
      const tickNow = Date.now();
      setNowMs(tickNow);
      const current = fixtureRef.current;
      const elapsedMinutes = deriveFastingElapsedMinutes(current.fasting.startedAt, tickNow);
      const nextPhase = deriveFastingPhase(elapsedMinutes, current.fasting.targetMinutes);
      if (nextPhase === current.fasting.phase) return;
      triggerFlash("fasting");
      pushToast(
        nextPhase === "fatburn" ? "断食 12h · 脂肪燃焼帯に入りました" : "断食 16h · 目標達成",
        "amber",
        "サーバ自動遷移 · scheduled function",
      );
      setFixture((prev) => ({ ...prev, fasting: { ...prev.fasting, phase: nextPhase } }));
    }, CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Random-walk demo tick (metrics jitter + simulated other-user events), gated by the demo toggle.
  useEffect(() => {
    if (!isDemoRunning) return;
    const id = setInterval(() => {
      const roll = Math.random();
      const current = fixtureRef.current;
      const metrics = nextDemoMetric(current.metrics, Math.random);
      if (roll < 0.32) {
        const state =
          PRESENCE_CYCLE[Math.floor(Math.random() * PRESENCE_CYCLE.length)] ?? PRESENCE_CYCLE[0];
        triggerFlash("partner");
        pushToast(`パートナー: ${formatPresence(state)}`, "blue", "パートナーの操作");
        setFixture((prev) => ({
          ...prev,
          metrics,
          partner: {
            etaHm: state === "commuting_home" ? "20:30" : null,
            state,
            updatedAt: Date.now(),
          },
        }));
      } else if (roll < 0.6) {
        const pending = current.dogCare.filter((item) => !item.done);
        const target = pending[Math.floor(Math.random() * pending.length)];
        if (target) {
          triggerFlash("dog");
          pushToast(
            `${current.dogName}の${DOG_EVENT_LABELS[target.kind]} ✓ 記録`,
            "coral",
            "パートナーの操作",
          );
          setFixture((prev) => ({
            ...prev,
            dogCare: prev.dogCare.map((item) =>
              item.kind === target.kind
                ? { ...item, at: Date.now(), by: "partner", done: true }
                : item,
            ),
            metrics,
          }));
        } else {
          setFixture((prev) => ({ ...prev, metrics }));
        }
      } else {
        setFixture((prev) => ({ ...prev, metrics }));
      }
    }, DEMO_TICK_MS);
    return () => clearInterval(id);
  }, [isDemoRunning]);

  useEffect(() => clearAllTimersOnUnmount, []);

  function clearAllTimersOnUnmount() {
    for (const timer of getToastTimers().values()) clearTimeout(timer);
    for (const timer of getFlashTimers().values()) clearTimeout(timer);
  }

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function onSetPerspective(next: Perspective) {
    setPerspective(next);
  }

  function onToggleDemo() {
    const next = !isDemoRunning;
    setIsDemoRunning(next);
    if (next) pushToast("デモ配信 ON · 疑似メトリクスを流し込み中", "good", "source: demo");
  }

  function onStartSession() {
    const startedAt = Date.now();
    setFixture((prev) => ({
      ...prev,
      session: {
        accumulatedMs: 0,
        category: "eikaiwa",
        goalMinutes: 30,
        interruptionCount: 0,
        lastInterruptionReason: null,
        lastResumedAt: startedAt,
        startedAt,
        status: "active",
      },
    }));
    triggerFlash("session");
    pushToast(`学習セッション開始 · ${CATEGORY_LABELS.eikaiwa}`, "good", whoLabel);
  }

  function onPauseSession(reason: InterruptionReason) {
    setFixture((prev) => {
      if (prev.session.status !== "active") return prev;
      const accumulatedMs =
        prev.session.accumulatedMs + Math.max(0, Date.now() - prev.session.lastResumedAt);
      return {
        ...prev,
        session: {
          ...prev.session,
          accumulatedMs,
          interruptionCount: prev.session.interruptionCount + 1,
          lastInterruptionReason: reason,
          status: "paused",
        },
      };
    });
    triggerFlash("session");
    pushToast(`セッション中断 · 理由: ${REASON_LABELS[reason]}`, "coral", whoLabel);
  }

  function onResumeSession() {
    setFixture((prev) => {
      if (prev.session.status !== "paused") return prev;
      return { ...prev, session: { ...prev.session, lastResumedAt: Date.now(), status: "active" } };
    });
    triggerFlash("session");
    pushToast("セッション再開", "good", whoLabel);
  }

  function onCompleteSession() {
    if (fixture.session.status !== "active" && fixture.session.status !== "paused") return;
    const elapsedMs = deriveSessionElapsedMs(fixture.session, Date.now());
    const elapsedMinutes = Math.round(elapsedMs / MINUTE_MS);
    setFixture((prev) => ({
      ...prev,
      declarations: prev.declarations.map((item) =>
        item.category === prev.session.category && item.status === "planned"
          ? { ...item, status: "done" }
          : item,
      ),
      session: {
        ...prev.session,
        accumulatedMs: deriveSessionElapsedMs(prev.session, Date.now()),
        status: "completed",
      },
      todayActualMinutes: prev.todayActualMinutes + elapsedMinutes,
    }));
    triggerFlash("session");
    pushToast(`セッション完了 · ${elapsedMinutes}分を記録`, "good", whoLabel);
  }

  function onSetPartnerPresence(state: PresenceState) {
    setFixture((prev) => ({
      ...prev,
      partner: {
        etaHm: state === "commuting_home" ? "20:30" : null,
        state,
        updatedAt: Date.now(),
      },
    }));
    triggerFlash("partner");
    pushToast(`パートナー: ${formatPresence(state)}`, "blue", whoLabel);
  }

  function onToggleDogCare(kind: DogEventKind) {
    const current = fixture.dogCare.find((item) => item.kind === kind);
    if (!current) return;
    const done = !current.done;
    setFixture((prev) => ({
      ...prev,
      dogCare: prev.dogCare.map((item) =>
        item.kind === kind
          ? {
              ...item,
              at: !item.done ? Date.now() : null,
              by: !item.done ? perspective : null,
              done: !item.done,
            }
          : item,
      ),
    }));
    triggerFlash("dog");
    pushToast(
      `${fixture.dogName}の${DOG_EVENT_LABELS[kind]} ${done ? "✓ 記録" : "取消"}`,
      done ? "coral" : "faint",
      whoLabel,
    );
  }

  const sessionElapsedMs = deriveSessionElapsedMs(fixture.session, nowMs);
  const fastingElapsedMinutes = deriveFastingElapsedMinutes(fixture.fasting.startedAt, nowMs);
  const declarationTotalMinutes = fixture.declarations.reduce(
    (sum, item) => sum + item.plannedMinutes,
    0,
  );
  const inProgressMinutes =
    fixture.session.status === "active" || fixture.session.status === "paused"
      ? Math.round(sessionElapsedMs / MINUTE_MS)
      : 0;
  const declarationActualMinutes = fixture.todayActualMinutes + inProgressMinutes;

  return {
    clockDateLabel: formatClockDate(nowMs),
    clockTime: formatClockTime(nowMs),
    declarationActualMinutes,
    declarationActualPercent:
      declarationTotalMinutes > 0
        ? Math.min(100, Math.round((declarationActualMinutes / declarationTotalMinutes) * 100))
        : 0,
    declarationTotalMinutes,
    dogFlash: flash.dog,
    fasting: fixture.fasting,
    fastingElapsedLabel: formatMinutesAsHm(fastingElapsedMinutes),
    fastingFlash: flash.fasting,
    fastingRemainLabel: formatMinutesAsHm(
      Math.max(0, fixture.fasting.targetMinutes - fastingElapsedMinutes),
    ),
    fastingRingPercent: Math.min(
      100,
      Math.round((fastingElapsedMinutes / fixture.fasting.targetMinutes) * 100),
    ),
    fixture,
    isDemoRunning,
    lastSyncRelativeLabel: formatRelativeTime(fixture.lastSyncAt, nowMs),
    onCompleteSession,
    onPauseSession,
    onResumeSession,
    onSetPartnerPresence,
    onSetPerspective,
    onStartSession,
    onToggleDemo,
    onToggleDogCare,
    onToggleTheme,
    partnerFlash: flash.partner,
    partnerUpdatedRelativeLabel: formatRelativeTime(fixture.partner.updatedAt, nowMs),
    perspective,
    sessionElapsedLabel: formatElapsedClock(sessionElapsedMs),
    sessionFlash: flash.session,
    sessionGoalLabel: `${fixture.session.goalMinutes}分`,
    sessionProgressPercent: Math.min(
      100,
      Math.round((sessionElapsedMs / MINUTE_MS / fixture.session.goalMinutes) * 100),
    ),
    theme,
    toasts,
  };
}
