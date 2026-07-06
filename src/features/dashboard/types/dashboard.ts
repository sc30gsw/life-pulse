// Display-oriented types for the Live Board UI (see docs/design/live-board.md).
// Union literals mirror the future `dashboard.live` Convex query shape (docs/spec.md §3)
// so swapping the demo fixture for a real subscription later requires no prop-shape changes.

export type SessionCategory = "eikaiwa" | "toeic" | "reading" | "other";

export const CATEGORY_LABELS = {
  eikaiwa: "英会話",
  other: "その他",
  reading: "読書",
  toeic: "TOEIC",
} as const satisfies Record<SessionCategory, string>;

export type SessionStatus = "idle" | "active" | "paused" | "completed";

export type InterruptionReason = "work" | "dog" | "chore" | "other";

export const REASON_LABELS = {
  chore: "家事",
  dog: "犬",
  other: "その他",
  work: "仕事",
} as const satisfies Record<InterruptionReason, string>;

export type SessionState = {
  accumulatedMs: number;
  category: SessionCategory;
  goalMinutes: number;
  interruptionCount: number;
  lastInterruptionReason: InterruptionReason | null;
  lastResumedAt: number;
  startedAt: number;
  status: SessionStatus;
};

export type FastingPhase = "early" | "fatburn" | "goal";
export type FastingStatus = "fasting" | "ended";

export const FASTING_PHASE_LABELS = {
  early: "空腹期",
  fatburn: "脂肪燃焼帯",
  goal: "目標達成",
} as const satisfies Record<FastingPhase, string>;

export const FASTING_PHASE_SUB_LABELS = {
  early: "12hで脂肪燃焼帯",
  fatburn: "16hで目標達成",
  goal: "16時間クリア",
} as const satisfies Record<FastingPhase, string>;

export type FastingState = {
  // Stored, scheduler-advanced field (docs/spec.md §4.2) — not purely derived from elapsed time.
  phase: FastingPhase;
  startedAt: number;
  status: FastingStatus;
  targetMinutes: number;
};

export type HealthMetricsSource = "garmin" | "manual" | "demo";

export const HEALTH_SOURCE_LABELS = {
  demo: "source: demo",
  garmin: "source: garmin",
  manual: "source: manual",
} as const satisfies Record<HealthMetricsSource, string>;

export type HealthMetrics = {
  bodyBattery: number;
  hrv: number;
  restingHr: number;
  sleepMinutes: number;
  sleepScore: number;
  source: HealthMetricsSource;
  steps: number;
};

export type DeclarationStatus = "planned" | "done" | "eroded";

export const DECLARATION_STATUS_LABELS = {
  done: "済",
  eroded: "侵食",
  planned: "予定",
} as const satisfies Record<DeclarationStatus, string>;

export type DeclarationItem = {
  category: SessionCategory;
  plannedMinutes: number;
  startHm: string;
  status: DeclarationStatus;
};

export type PresenceState = "home" | "office" | "commuting_home" | "out" | "sleeping";

export const PRESENCE_LABELS = {
  commuting_home: "帰宅中",
  home: "在宅",
  office: "出社中",
  out: "外出",
  sleeping: "就寝",
} as const satisfies Record<PresenceState, string>;

export const PRESENCE_SUB_LABELS = {
  commuting_home: "ETA 20:30",
  home: "家にいます",
  office: "オフィス勤務",
  out: "外にいます",
  sleeping: "おやすみ",
} as const satisfies Record<PresenceState, string>;

export type PartnerState = {
  etaHm: string | null;
  state: PresenceState;
  updatedAt: number;
};

export type DogEventKind =
  | "walk_am"
  | "walk_pm"
  | "meal_am"
  | "meal_pm"
  | "meds"
  | "toilet"
  | "other";

export const DOG_EVENT_LABELS = {
  meal_am: "朝ごはん",
  meal_pm: "夜ごはん",
  meds: "薬",
  other: "その他",
  toilet: "トイレ",
  walk_am: "朝散歩",
  walk_pm: "夜散歩",
} as const satisfies Record<DogEventKind, string>;

export type DogCareBy = "self" | "partner";

export type DogCareItem = {
  at: number | null;
  by: DogCareBy | null;
  done: boolean;
  kind: DogEventKind;
};

export type ToastAccent = "good" | "amber" | "blue" | "coral" | "violet" | "faint";

// Shared accent → Tailwind token class mapping. All chips/dots/pills across the board
// (session status, fasting phase, partner presence, dog care, toasts) key off this
// single map so accent colors stay consistent without hardcoding hex anywhere.
export const ACCENT_CLASSES = {
  amber: { bg: "bg-amber/16", border: "border-amber", text: "text-amber" },
  blue: { bg: "bg-blue/16", border: "border-blue", text: "text-blue" },
  coral: { bg: "bg-coral/16", border: "border-coral", text: "text-coral" },
  faint: { bg: "bg-inset", border: "border-bd-2", text: "text-faint" },
  good: { bg: "bg-good/16", border: "border-good", text: "text-good" },
  violet: { bg: "bg-violet/16", border: "border-violet", text: "text-violet" },
} as const satisfies Record<ToastAccent, Record<"bg" | "border" | "text", string>>;

// Raw CSS custom-property references, for Mantine props that apply a color directly
// without computing a light/dark variant (Progress `color`, RingProgress section `color`).
export const ACCENT_VARS = {
  amber: "var(--amber)",
  blue: "var(--blue)",
  coral: "var(--coral)",
  faint: "var(--faint)",
  good: "var(--good)",
  violet: "var(--violet)",
} as const satisfies Record<ToastAccent, string>;

// Ready-made {backgroundColor, color} pairs for solid Mantine elements (Button, Badge)
// whose built-in variant/auto-contrast color math cannot resolve an opaque CSS custom
// property — pass this object to the component's `style` prop. Text is always `--bg`
// (the page background token) since every accent here is a light color meant to sit
// on the page background, matching the canonical design.
export const ACCENT_SOLID_STYLE = {
  amber: { backgroundColor: "var(--amber)", color: "var(--bg)" },
  blue: { backgroundColor: "var(--blue)", color: "var(--bg)" },
  coral: { backgroundColor: "var(--coral)", color: "var(--bg)" },
  faint: { backgroundColor: "var(--faint)", color: "var(--bg)" },
  good: { backgroundColor: "var(--good)", color: "var(--bg)" },
  violet: { backgroundColor: "var(--violet)", color: "var(--bg)" },
} as const satisfies Record<ToastAccent, Record<"backgroundColor" | "color", string>>;

export type BoardToast = {
  accent: ToastAccent;
  id: number;
  text: string;
  who: string;
};

export type Perspective = "self" | "partner";
export type ThemeMode = "dark" | "light";

// Raw fixture shape — stands in for the future `dashboard.live` Convex query result.
export type DashboardFixture = {
  declarations: DeclarationItem[];
  dogCare: DogCareItem[];
  dogName: string;
  fasting: FastingState;
  lastSyncAt: number;
  metrics: HealthMetrics;
  partner: PartnerState;
  session: SessionState;
  todayActualMinutes: number;
};
