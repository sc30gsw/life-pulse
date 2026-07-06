// Static demo seed for the Live Board — values match the canonical design file's
// constructor defaults (claude_design "Live Board.dc.html"), expressed as ms-ago
// offsets so `resolveDashboardFixture` can anchor them to a real mount-time clock
// without ever calling Date.now() itself (deterministic, SSR-safe, unit-testable).
import type {
  DashboardFixture,
  DeclarationItem,
  DogCareBy,
  DogEventKind,
  FastingPhase,
  HealthMetrics,
  InterruptionReason,
  PresenceState,
  SessionCategory,
  SessionStatus,
} from "~/features/dashboard/types/dashboard";

const MINUTE_MS = 60_000;

type DashboardFixtureSeed = {
  declarations: DeclarationItem[];
  dogCareSeed: {
    agoMinutes: number | null;
    by: DogCareBy | null;
    done: boolean;
    kind: DogEventKind;
  }[];
  dogName: string;
  fastingSeed: {
    initialPhase: FastingPhase;
    startedAtAgoMinutes: number;
    targetMinutes: number;
  };
  lastSyncAtAgoMinutes: number;
  metrics: HealthMetrics;
  partnerSeed: {
    etaHm: string | null;
    state: PresenceState;
    updatedAtAgoMinutes: number;
  };
  sessionSeed: {
    accumulatedMs: number;
    category: SessionCategory;
    goalMinutes: number;
    interruptionCount: number;
    lastInterruptionReason: InterruptionReason | null;
    lastResumedAtAgoMinutes: number;
    status: SessionStatus;
  };
  todayActualMinutes: number;
};

export const DASHBOARD_FIXTURE_SEED = {
  declarations: [
    { category: "toeic", plannedMinutes: 60, startHm: "06:00", status: "done" },
    { category: "eikaiwa", plannedMinutes: 30, startHm: "13:00", status: "planned" },
  ],
  dogCareSeed: [
    { agoMinutes: 82, by: "self", done: true, kind: "walk_am" },
    { agoMinutes: 78, by: "self", done: true, kind: "meal_am" },
    { agoMinutes: 70, by: "partner", done: true, kind: "meds" },
    { agoMinutes: null, by: null, done: false, kind: "walk_pm" },
    { agoMinutes: null, by: null, done: false, kind: "meal_pm" },
  ],
  dogName: "ハマロ",
  fastingSeed: {
    initialPhase: "early",
    startedAtAgoMinutes: 11 * 60 + 40,
    targetMinutes: 16 * 60,
  },
  lastSyncAtAgoMinutes: 38,
  metrics: {
    bodyBattery: 76,
    hrv: 58,
    restingHr: 47,
    sleepMinutes: Math.round(7.2 * 60),
    sleepScore: 84,
    source: "garmin",
    steps: 2840,
  },
  partnerSeed: {
    etaHm: null,
    state: "office",
    updatedAtAgoMinutes: 38,
  },
  sessionSeed: {
    accumulatedMs: 8 * MINUTE_MS,
    category: "toeic",
    goalMinutes: 60,
    interruptionCount: 1,
    lastInterruptionReason: "dog",
    lastResumedAtAgoMinutes: 12,
    status: "active",
  },
  todayActualMinutes: 42,
} as const satisfies DashboardFixtureSeed;

export function resolveDashboardFixture(nowMs: number): DashboardFixture {
  const seed = DASHBOARD_FIXTURE_SEED;
  const ago = (minutes: number) => nowMs - minutes * MINUTE_MS;

  return {
    declarations: seed.declarations,
    dogCare: seed.dogCareSeed.map((item) => ({
      at: item.agoMinutes === null ? null : ago(item.agoMinutes),
      by: item.by,
      done: item.done,
      kind: item.kind,
    })),
    dogName: seed.dogName,
    fasting: {
      phase: seed.fastingSeed.initialPhase,
      startedAt: ago(seed.fastingSeed.startedAtAgoMinutes),
      status: "fasting",
      targetMinutes: seed.fastingSeed.targetMinutes,
    },
    lastSyncAt: ago(seed.lastSyncAtAgoMinutes),
    metrics: seed.metrics,
    partner: {
      etaHm: seed.partnerSeed.etaHm,
      state: seed.partnerSeed.state,
      updatedAt: ago(seed.partnerSeed.updatedAtAgoMinutes),
    },
    session: {
      accumulatedMs: seed.sessionSeed.accumulatedMs,
      category: seed.sessionSeed.category,
      goalMinutes: seed.sessionSeed.goalMinutes,
      interruptionCount: seed.sessionSeed.interruptionCount,
      lastInterruptionReason: seed.sessionSeed.lastInterruptionReason,
      lastResumedAt: ago(seed.sessionSeed.lastResumedAtAgoMinutes),
      startedAt: ago(seed.sessionSeed.lastResumedAtAgoMinutes),
      status: seed.sessionSeed.status,
    },
    todayActualMinutes: seed.todayActualMinutes,
  };
}
