import { expect, test } from "vite-plus/test";

import type { Doc } from "../../_generated/dataModel";
import { suggestRescheduleSlots } from "./suggestRescheduleSlots";

function buildBlock(overrides: Partial<Doc<"studyBlocks">>): Doc<"studyBlocks"> {
  return {
    _creationTime: 0,
    _id: "block_1",
    category: "toeic",
    dateJst: "2026-07-07",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    userId: "user_1",
    ...overrides,
  } as Doc<"studyBlocks">;
}

test("returns up to 5 half-hour slots from the next 30-minute mark", () => {
  expect(suggestRescheduleSlots([], "13:05")).toEqual([
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
  ]);
});

test("starts at now when now is already on a 30-minute mark", () => {
  expect(suggestRescheduleSlots([], "14:00")[0]).toBe("14:00");
});

test("skips slots overlapping planned blocks but keeps non-planned ones", () => {
  const blocks = [
    buildBlock({ endHm: "14:30", startHm: "13:30", status: "planned" }),
    buildBlock({ _id: "block_2" as never, endHm: "16:00", startHm: "15:00", status: "eroded" }),
  ];

  expect(suggestRescheduleSlots(blocks, "13:00")).toEqual([
    "13:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ]);
});

test("returns nothing at or after 22:00", () => {
  expect(suggestRescheduleSlots([], "21:31")).toEqual([]);
  expect(suggestRescheduleSlots([], "21:30")).toEqual(["21:30"]);
});

test("returns an empty list for a malformed nowHm", () => {
  expect(suggestRescheduleSlots([], "9pm")).toEqual([]);
});
