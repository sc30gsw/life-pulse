import { expect, test } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import {
  deriveFastingElapsedMinutes,
  deriveSessionElapsedMs,
  formatClockDate,
  formatClockDateCompact,
  formatClockTime,
  formatClockTimeMinutes,
  formatElapsedClock,
  formatMinutesAsHm,
  formatRelativeTime,
  toDeclarationItems,
  toDogCareItems,
} from "~/features/dashboard/utils/format";

function buildStudySession(overrides: Partial<Doc<"studySessions">> = {}): Doc<"studySessions"> {
  return {
    _creationTime: 0,
    _id: "session_1",
    accumulatedMs: 0,
    category: "toeic",
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
    category: "toeic",
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

test("formatClockTimeMinutes drops seconds for the once-a-minute board clock", () => {
  const nowMs = Date.UTC(2026, 6, 7, 3, 15, 47);
  expect(formatClockTimeMinutes(nowMs)).toBe("12:15");
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
    buildStudyBlock({ category: "toeic", plannedMinutes: 30, startHm: "06:00", status: "planned" }),
    buildStudyBlock({
      category: "reading",
      plannedMinutes: 20,
      startHm: "21:00",
      status: "rescheduled",
    }),
  ];

  expect(toDeclarationItems(blocks)).toEqual([
    { category: "toeic", plannedMinutes: 30, startHm: "06:00", status: "planned" },
    { category: "reading", plannedMinutes: 20, startHm: "21:00", status: "rescheduled" },
  ]);
});

test("toDogCareItems returns all seven fixed kinds as pending when no events exist", () => {
  const items = toDogCareItems([]);

  expect(items).toHaveLength(7);
  expect(items.map((item) => item.kind)).toEqual([
    "walk_am",
    "meal_am",
    "meal_noon",
    "meds",
    "walk_pm",
    "meal_pm",
    "brush_teeth",
  ]);
  expect(items.every((item) => !item.done && item.at === null && item.by === null)).toBe(true);
});

test("toDogCareItems marks a logged kind as done with its actor and time", () => {
  const items = toDogCareItems([
    {
      at: 1000,
      byDisplayName: "パートナー",
      byRole: "partner",
      id: "event_1" as Id<"dogEvents">,
      kind: "meal_am",
    },
  ]);
  const mealAm = items.find((item) => item.kind === "meal_am");

  expect(mealAm).toEqual({ at: 1000, by: "partner", done: true, kind: "meal_am" });
});

test("toDogCareItems ignores logged kinds outside the fixed checklist", () => {
  const items = toDogCareItems([
    {
      at: 1000,
      byDisplayName: "本人",
      byRole: "self",
      id: "event_2" as Id<"dogEvents">,
      kind: "toilet",
    },
  ]);

  expect(items.every((item) => !item.done)).toBe(true);
});
