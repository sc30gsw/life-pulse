import { expect, test } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import {
  deriveFastingElapsedMinutes,
  deriveSessionElapsedMs,
  formatClockDate,
  formatClockDateCompact,
  formatClockTime,
  formatElapsedClock,
  formatMinutesAsHm,
  formatRelativeTime,
  toDeclarationItems,
  toDogCareItems,
} from "~/features/dashboard/utils/format";

const TOEIC_CATEGORY_ID = "category_toeic" as Id<"studyCategories">;
const READING_CATEGORY_ID = "category_reading" as Id<"studyCategories">;

function buildStudySession(overrides: Partial<Doc<"studySessions">> = {}): Doc<"studySessions"> {
  return {
    _creationTime: 0,
    _id: "session_1",
    accumulatedMs: 0,
    categoryId: TOEIC_CATEGORY_ID,
    dateJst: "2026-07-07",
    interruptionCount: 0,
    startedAt: 1_000,
    status: "active",
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"studySessions">;
}

function buildStudyBlock(overrides: Partial<Doc<"studyBlocks">> = {}): Doc<"studyBlocks"> {
  return {
    _creationTime: 0,
    _id: "block_1",
    categoryId: TOEIC_CATEGORY_ID,
    dateJst: "2026-07-07",
    endHm: "07:00",
    plannedMinutes: 30,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"studyBlocks">;
}

test("formatElapsedClock formats a sub-hour duration as mm:ss", () => {
  expect(formatElapsedClock(90_000)).toBe("01:30");
});

test("formatElapsedClock formats an hour-plus duration as h:mm:ss", () => {
  expect(formatElapsedClock(3_661_000)).toBe("1:01:01");
});

test("formatMinutesAsHm formats a sub-hour value as Nm", () => {
  expect(formatMinutesAsHm(45)).toBe("45m");
});

test("formatMinutesAsHm formats an hour-plus value as NhMMm", () => {
  expect(formatMinutesAsHm(125)).toBe("2h05m");
});

test("formatRelativeTime returns たった今 for deltas under 8 seconds", () => {
  expect(formatRelativeTime(1_000, 5_000)).toBe("たった今");
});

test("formatRelativeTime clamps a negative delta (server clock ahead of client) to たった今", () => {
  expect(formatRelativeTime(10_000, 5_000)).toBe("たった今");
});

test("formatRelativeTime returns seconds-ago for deltas under 60 seconds", () => {
  expect(formatRelativeTime(0, 30_000)).toBe("30秒前");
});

test("formatRelativeTime returns minutes-ago for deltas under an hour", () => {
  expect(formatRelativeTime(0, 5 * 60_000)).toBe("5分前");
});

test("formatRelativeTime returns hours-ago for deltas under a day", () => {
  expect(formatRelativeTime(0, 3 * 3_600_000)).toBe("3時間前");
});

test("formatRelativeTime returns days-ago for deltas of a day or more", () => {
  expect(formatRelativeTime(0, 2 * 86_400_000)).toBe("2日前");
});

test("formatClockTime and formatClockDate format against Asia/Tokyo", () => {
  const nowMs = Date.UTC(2026, 6, 7, 3, 15, 0);
  expect(formatClockTime(nowMs)).toBe("12:15:00");
  expect(formatClockDate(nowMs)).toBe("2026/7/7(火)");
});

test("formatClockTime includes seconds for the board header clock", () => {
  const nowMs = Date.UTC(2026, 6, 7, 3, 15, 47);
  expect(formatClockTime(nowMs)).toBe("12:15:47");
});

test("formatClockDateCompact drops the year for narrow viewports", () => {
  const nowMs = Date.UTC(2026, 6, 7, 3, 15, 0);
  expect(formatClockDateCompact(nowMs)).toBe("7/7(火)");
});

test("deriveSessionElapsedMs returns 0 when there is no session", () => {
  expect(deriveSessionElapsedMs(null, 9_000)).toBe(0);
});

test("deriveSessionElapsedMs adds now-minus-lastResumedAt only while active", () => {
  const activeSession = buildStudySession({
    accumulatedMs: 10_000,
    lastResumedAt: 4_000,
    status: "active",
  });
  expect(deriveSessionElapsedMs(activeSession, 9_000)).toBe(10_000 + Math.max(0, 9_000 - 4_000));

  const pausedSession = buildStudySession({
    accumulatedMs: 10_000,
    lastResumedAt: 4_000,
    status: "paused",
  });
  expect(deriveSessionElapsedMs(pausedSession, 9_000)).toBe(10_000);
});

test("deriveSessionElapsedMs falls back lastResumedAt to startedAt when absent", () => {
  const session = buildStudySession({ accumulatedMs: 0, startedAt: 3_000, status: "active" });
  expect(deriveSessionElapsedMs(session, 9_000)).toBe(Math.max(0, 9_000 - 3_000));
});

test("deriveFastingElapsedMinutes derives elapsed minutes from start to now", () => {
  expect(deriveFastingElapsedMinutes(0, 5 * 60_000)).toBe(5);
});

test("toDeclarationItems maps an empty array to an empty array", () => {
  expect(toDeclarationItems([])).toEqual([]);
});

test("toDeclarationItems maps blocks through, applying the category cast", () => {
  const blocks = [
    buildStudyBlock({
      categoryId: TOEIC_CATEGORY_ID,
      plannedMinutes: 30,
      startHm: "06:00",
      status: "planned",
    }),
    buildStudyBlock({
      categoryId: READING_CATEGORY_ID,
      plannedMinutes: 20,
      startHm: "21:00",
      status: "rescheduled",
    }),
  ];

  expect(toDeclarationItems(blocks)).toEqual([
    { categoryId: TOEIC_CATEGORY_ID, plannedMinutes: 30, startHm: "06:00", status: "planned" },
    {
      categoryId: READING_CATEGORY_ID,
      plannedMinutes: 20,
      startHm: "21:00",
      status: "rescheduled",
    },
  ]);
});

test("toDogCareItems maps dynamic dog tasks as pending when no event is attached", () => {
  const items = toDogCareItems([
    {
      at: undefined,
      byRole: undefined,
      done: false,
      eventId: undefined,
      name: "朝散歩",
      taskId: "task_1" as Id<"dogTasks">,
    },
    {
      at: undefined,
      byRole: undefined,
      done: false,
      eventId: undefined,
      name: "朝ごはん",
      taskId: "task_2" as Id<"dogTasks">,
    },
  ]);

  expect(items).toHaveLength(2);
  expect(items.map((item) => item.name)).toEqual(["朝散歩", "朝ごはん"]);
  expect(items.every((item) => !item.done && item.at === null && item.by === null)).toBe(true);
});

test("toDogCareItems marks a logged task as done with its actor and time", () => {
  const items = toDogCareItems([
    {
      at: 1000,
      byRole: "partner",
      done: true,
      eventId: "event_1" as Id<"dogEvents">,
      name: "朝ごはん",
      taskId: "task_1" as Id<"dogTasks">,
    },
  ]);
  const mealAm = items.find((item) => item.taskId === ("task_1" as Id<"dogTasks">));

  expect(mealAm).toEqual({
    at: 1000,
    by: "partner",
    done: true,
    eventId: "event_1",
    name: "朝ごはん",
    taskId: "task_1",
  });
});
