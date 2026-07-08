export const ROLE_VALUES = ["self", "partner"] as const satisfies readonly string[];

export const CATEGORY_VALUES = [
  "eikaiwa",
  "toeic",
  "reading",
  "other",
] as const satisfies readonly string[];

export const SESSION_STATUS_VALUES = [
  "active",
  "paused",
  "completed",
  "abandoned",
] as const satisfies readonly string[];

export const INTERRUPTION_REASON_VALUES = [
  "work",
  "dog",
  "chore",
  "other",
] as const satisfies readonly string[];

export const BLOCK_STATUS_VALUES = [
  "planned",
  "done",
  "eroded",
  "rescheduled",
  "declined",
] as const satisfies readonly string[];

export const STUDY_BLOCK_SOURCE_VALUES = [
  "manual",
  "suggested",
] as const satisfies readonly string[];

export const EROSION_REASON_VALUES = [
  "work",
  "fatigue",
  "interruption",
  "other",
] as const satisfies readonly string[];

export const FASTING_PHASE_VALUES = [
  "early",
  "fatburn",
  "goal",
] as const satisfies readonly string[];
export const SCHEDULED_FASTING_PHASE_VALUES = [
  "fatburn",
  "goal",
] as const satisfies readonly string[];
export const FASTING_STATUS_VALUES = ["fasting", "ended"] as const satisfies readonly string[];

export const HEALTH_SOURCE_VALUES = [
  "garmin",
  "manual",
  "demo",
] as const satisfies readonly string[];

export const WORKOUT_KIND_VALUES = ["hiit", "walk", "other"] as const satisfies readonly string[];

export const PRESENCE_STATE_VALUES = [
  "home",
  "office",
  "commuting_home",
  "out",
  "sleeping",
] as const satisfies readonly string[];

export const DOG_TASK_MOVE_DIRECTION_VALUES = ["up", "down"] as const satisfies readonly string[];

export const DATE_JST_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const MIN_FASTING_TARGET_MINUTES = 1;
export const DEFAULT_FASTING_MINUTES = 960;
export const MAX_FASTING_TARGET_MINUTES = 960;
export const FASTING_FATBURN_MINUTES = 720;
export const FASTING_TARGET_SLIDER_MARK_MINUTES = [
  240, 480, 720,
] as const satisfies readonly number[];
