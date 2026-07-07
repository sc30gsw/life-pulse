import { expect, test } from "vite-plus/test";

import { phaseSchedule } from "./phaseSchedule";

test("targetMinutes >= 720 schedules fatburn at 720 and goal at targetMinutes", () => {
  expect(phaseSchedule(960)).toEqual([
    { afterMinutes: 720, to: "fatburn" },
    { afterMinutes: 960, to: "goal" },
  ]);
});

test("targetMinutes < 720 schedules fatburn at half of targetMinutes", () => {
  expect(phaseSchedule(480)).toEqual([
    { afterMinutes: 240, to: "fatburn" },
    { afterMinutes: 480, to: "goal" },
  ]);
});

test("targetMinutes === 720 boundary hits the >= 720 branch (fatburn and goal at the same time)", () => {
  expect(phaseSchedule(720)).toEqual([
    { afterMinutes: 720, to: "fatburn" },
    { afterMinutes: 720, to: "goal" },
  ]);
});
