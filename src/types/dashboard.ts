import type {
  BLOCK_STATUS_VALUES,
  CATEGORY_VALUES,
  EROSION_REASON_VALUES,
  FASTING_PHASE_VALUES,
  HEALTH_SOURCE_VALUES,
  INTERRUPTION_REASON_VALUES,
  PRESENCE_STATE_VALUES,
  SESSION_STATUS_VALUES,
  WORKOUT_KIND_VALUES,
} from "~/../convex/lib/domain";

// Display-oriented labels/tokens for the Live Board UI (see docs/design/live-board.md).
// Data-shape types are NOT duplicated here — components import `Doc`/`FunctionReturnType`
// from Convex's generated types directly, so convex/schema.ts stays the single source of
// truth. Label-map key types derive from convex/lib/domain.ts value tuples, per CVX-16.

export type SessionCategory = (typeof CATEGORY_VALUES)[number];

export const CATEGORY_LABELS = {
  eikaiwa: "英会話",
  other: "その他",
  reading: "読書",
  toeic: "TOEIC",
} as const satisfies Record<SessionCategory, string>;

export type InterruptionReason = (typeof INTERRUPTION_REASON_VALUES)[number];

export const REASON_LABELS = {
  chore: "家事",
  dog: "犬",
  other: "その他",
  work: "仕事",
} as const satisfies Record<InterruptionReason, string>;

export type ErosionReason = (typeof EROSION_REASON_VALUES)[number];

export const EROSION_REASON_LABELS = {
  fatigue: "疲労",
  interruption: "割り込み",
  other: "その他",
  work: "仕事",
} as const satisfies Record<ErosionReason, string>;

export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];

export const SESSION_STATUS_LABELS = {
  abandoned: "放置終了",
  active: "進行中",
  completed: "完了",
  paused: "中断中",
} as const satisfies Record<SessionStatus, string>;

type FastingPhase = (typeof FASTING_PHASE_VALUES)[number];

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

type HealthMetricsSource = (typeof HEALTH_SOURCE_VALUES)[number];

export const HEALTH_SOURCE_LABELS = {
  demo: "source: demo",
  garmin: "source: garmin",
  manual: "source: manual",
} as const satisfies Record<HealthMetricsSource, string>;

export type WorkoutKind = (typeof WORKOUT_KIND_VALUES)[number];

export const WORKOUT_KIND_LABELS = {
  hiit: "HIIT",
  other: "その他",
  walk: "ウォーキング",
} as const satisfies Record<WorkoutKind, string>;

export type DeclarationStatus = (typeof BLOCK_STATUS_VALUES)[number];

export const DECLARATION_STATUS_LABELS = {
  declined: "見送り",
  done: "済",
  eroded: "侵食",
  planned: "予定",
  rescheduled: "リスケ済",
} as const satisfies Record<DeclarationStatus, string>;

export type PresenceState = (typeof PRESENCE_STATE_VALUES)[number];

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

export type AccentName = "good" | "amber" | "blue" | "coral" | "violet" | "faint";

// Shared accent → Tailwind token class mapping. All chips/dots/pills across the board
// (session status, fasting phase, partner presence, dog care) key off this
// single map so accent colors stay consistent without hardcoding hex anywhere.
export const ACCENT_CLASSES = {
  amber: { bg: "bg-amber/16", border: "border-amber", text: "text-amber" },
  blue: { bg: "bg-blue/16", border: "border-blue", text: "text-blue" },
  coral: { bg: "bg-coral/16", border: "border-coral", text: "text-coral" },
  faint: { bg: "bg-inset", border: "border-bd-2", text: "text-faint" },
  good: { bg: "bg-good/16", border: "border-good", text: "text-good" },
  violet: { bg: "bg-violet/16", border: "border-violet", text: "text-violet" },
} as const satisfies Record<AccentName, Record<"bg" | "border" | "text", string>>;

// Raw CSS custom-property references, for Mantine props that apply a color directly
// without computing a light/dark variant (Progress `color`, RingProgress section `color`).
export const ACCENT_VARS = {
  amber: "var(--amber)",
  blue: "var(--blue)",
  coral: "var(--coral)",
  faint: "var(--faint)",
  good: "var(--good)",
  violet: "var(--violet)",
} as const satisfies Record<AccentName, string>;

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
} as const satisfies Record<AccentName, Record<"backgroundColor" | "color", string>>;

export type ThemeMode = "dark" | "light";
