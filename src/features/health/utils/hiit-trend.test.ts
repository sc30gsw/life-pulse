import { expect, test } from "vite-plus/test";

import {
  HIIT_TREND_DAYS,
  bucketDailyDuration,
  hiitTrendRangeJst,
} from "~/features/health/utils/hiit-trend";
import { todayJst } from "~/utils/date-jst";

test("spans exactly HIIT_TREND_DAYS calendar days ending today", () => {
  const { fromDateJst, toDateJst } = hiitTrendRangeJst();
  const spanDays = (Date.parse(toDateJst) - Date.parse(fromDateJst)) / 86_400_000 + 1;

  expect(toDateJst).toBe(todayJst());
  expect(spanDays).toBe(HIIT_TREND_DAYS);
});

test("sums same-day workouts and fills days with no workout as 0", () => {
  const { toDateJst } = hiitTrendRangeJst();

  const days = bucketDailyDuration([
    { dateJst: toDateJst, durationMinutes: 20 },
    { dateJst: toDateJst, durationMinutes: 15 },
  ]);

  expect(days).toHaveLength(HIIT_TREND_DAYS);
  expect(days.at(-1)?.durationMinutes).toBe(35);
  expect(days.slice(0, -1).every((day) => day.durationMinutes === 0)).toBe(true);
});

test("ignores workouts outside the trailing window", () => {
  const days = bucketDailyDuration([{ dateJst: "2000-01-01", durationMinutes: 99 }]);

  expect(days.every((day) => day.durationMinutes === 0)).toBe(true);
});
