import type { FunctionReturnType } from "convex/server";

import type { api } from "~/../convex/_generated/api";
import type { Doc } from "~/../convex/_generated/dataModel";
import { dayjs } from "~/utils/dayjs";
import { formatRelativeTime } from "~/utils/relative-time";
import { TIME_CONSTANTS } from "~/utils/time-constants";

export { formatRelativeTime };

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

export function formatClockTime(nowMs: number) {
  return dayjs(nowMs).tz("Asia/Tokyo").format("HH:mm:ss");
}

export function formatClockDate(nowMs: number) {
  return dayjs(nowMs).tz("Asia/Tokyo").format("YYYY/M/D(ddd)");
}

// Compact variant for very narrow viewports (375px, NFR-2) — drops the year so the
// board header's date + "· JST" suffix never risks wrapping.
export function formatClockDateCompact(nowMs: number) {
  return dayjs(nowMs).tz("Asia/Tokyo").format("M/D(ddd)");
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
    categoryId: block.categoryId,
    plannedMinutes: block.plannedMinutes,
    startHm: block.startHm,
    status: block.status,
  }));
}

export function toDogCareItems(
  tasks: NonNullable<FunctionReturnType<typeof api.queries.dashboard.dog.dog>>["tasks"],
) {
  return tasks.map((task) => ({
    at: task.at ?? null,
    by: task.byRole ?? null,
    done: task.done,
    eventId: task.eventId ?? null,
    name: task.name,
    taskId: task.taskId,
  }));
}
