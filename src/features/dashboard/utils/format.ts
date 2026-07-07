import type { FunctionReturnType } from "convex/server";

import type { api } from "~/../convex/_generated/api";
import type { Doc } from "~/../convex/_generated/dataModel";
import type { DogEventKind } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

// Fixed daily checklist (FR-1.4 / design) — deliberately excludes "toilet" and "other",
// which are logged but not part of the at-a-glance done/pending board.
const DOG_CARE_KINDS = [
  "walk_am",
  "meal_am",
  "meal_noon",
  "meds",
  "walk_pm",
  "meal_pm",
  "brush_teeth",
] as const satisfies DogEventKind[];

const TIME_CONSTANTS = {
  SECOND_MS: 1000,
  MINUTE_SECONDS: 60,
  HOUR_SECONDS: 3600,
  DAY_SECONDS: 86_400,
  MINUTE_MS: 60_000,
  JUST_NOW_THRESHOLD_SECONDS: 8,
} as const satisfies Record<string, number>;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatElapsedClock(ms: number) {
  const totalSeconds = Math.floor(ms / TIME_CONSTANTS.SECOND_MS);
  const hours = Math.floor(totalSeconds / TIME_CONSTANTS.HOUR_SECONDS);
  const minutes = Math.floor(
    (totalSeconds % TIME_CONSTANTS.HOUR_SECONDS) / TIME_CONSTANTS.MINUTE_SECONDS,
  );
  const seconds = totalSeconds % TIME_CONSTANTS.MINUTE_SECONDS;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function formatMinutesAsHm(rawMinutes: number) {
  const minutes = Math.max(0, Math.round(rawMinutes));
  const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTE_SECONDS);
  const remainder = minutes % TIME_CONSTANTS.MINUTE_SECONDS;
  return hours > 0 ? `${hours}h${pad(remainder)}m` : `${remainder}m`;
}

export function formatRelativeTime(
  pastMs:
    | NonNullable<FunctionReturnType<typeof api.queries.dashboard.health.health>>["syncedAt"]
    | NonNullable<FunctionReturnType<typeof api.queries.dashboard.presence.presence>>["updatedAt"],
  nowMs: number,
) {
  // Server timestamps can sit slightly ahead of the client clock — clamp so skew
  // never produces a negative delta.
  const deltaSeconds = Math.max(0, Math.floor((nowMs - pastMs) / TIME_CONSTANTS.SECOND_MS));
  if (deltaSeconds < TIME_CONSTANTS.JUST_NOW_THRESHOLD_SECONDS) {
    return "たった今";
  }

  if (deltaSeconds < TIME_CONSTANTS.MINUTE_SECONDS) {
    return `${deltaSeconds}秒前`;
  }

  if (deltaSeconds < TIME_CONSTANTS.HOUR_SECONDS) {
    return `${Math.floor(deltaSeconds / TIME_CONSTANTS.MINUTE_SECONDS)}分前`;
  }

  if (deltaSeconds < TIME_CONSTANTS.DAY_SECONDS) {
    return `${Math.floor(deltaSeconds / TIME_CONSTANTS.HOUR_SECONDS)}時間前`;
  }

  return `${Math.floor(deltaSeconds / TIME_CONSTANTS.DAY_SECONDS)}日前`;
}

export function formatClockTime(nowMs: number) {
  return dayjs(nowMs).tz("Asia/Tokyo").format("HH:mm:ss");
}

export function formatClockDate(nowMs: number) {
  return dayjs(nowMs).tz("Asia/Tokyo").format("YYYY/M/D(ddd)");
}

export function deriveSessionElapsedMs(session: Doc<"studySessions"> | null, nowMs: number) {
  if (session === null) {
    return 0;
  }

  if (session.status !== "active") {
    return session.accumulatedMs;
  }

  //* A session that just resumed may have lastResumedAt set slightly after startedAt on
  //* first activation — fall back to startedAt so this never reads as undefined.
  return session.accumulatedMs + Math.max(0, nowMs - (session.lastResumedAt ?? session.startedAt));
}

export function deriveFastingElapsedMinutes(
  fastingStartedAt: NonNullable<
    FunctionReturnType<typeof api.queries.dashboard.fasting.fasting>
  >["startedAt"],
  nowMs: number,
) {
  return Math.max(0, (nowMs - fastingStartedAt) / TIME_CONSTANTS.MINUTE_MS);
}

export function toDeclarationItems(blocks: Doc<"studyBlocks">[]) {
  return blocks.map((block) => ({
    category: block.category,
    plannedMinutes: block.plannedMinutes,
    startHm: block.startHm,
    status: block.status,
  }));
}

export function toDogCareItems(
  events: FunctionReturnType<typeof api.queries.dashboard.dog.dog>["events"],
) {
  return DOG_CARE_KINDS.map((kind) => {
    const event = events.find((candidate) => candidate.kind === kind);

    return event === undefined
      ? { at: null, by: null, done: false, kind }
      : { at: event.at, by: event.byRole, done: true, kind };
  });
}
