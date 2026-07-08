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

test("sums same-day, same-kind workouts and fills days with no workout as 0", () => {
  const { toDateJst } = hiitTrendRangeJst();

  const days = bucketDailyDuration([
    { dateJst: toDateJst, durationMinutes: 20, kind: "hiit" },
    { dateJst: toDateJst, durationMinutes: 15, kind: "hiit" },
  ]);

  expect(days).toHaveLength(HIIT_TREND_DAYS);
  expect(days.at(-1)).toStrictEqual({ date: expect.any(String), hiit: 35, other: 0, walk: 0 });
  expect(
    days.slice(0, -1).every((day) => day.hiit === 0 && day.walk === 0 && day.other === 0),
  ).toBe(true);
});

test("buckets each kind into its own series", () => {
  const { toDateJst } = hiitTrendRangeJst();

  const days = bucketDailyDuration([
    { dateJst: toDateJst, durationMinutes: 20, kind: "hiit" },
    { dateJst: toDateJst, durationMinutes: 30, kind: "walk" },
    { dateJst: toDateJst, durationMinutes: 10, kind: "other" },
  ]);

  expect(days.at(-1)).toStrictEqual({ date: expect.any(String), hiit: 20, other: 10, walk: 30 });
});

test("ignores workouts outside the trailing window", () => {
  const days = bucketDailyDuration([{ dateJst: "2000-01-01", durationMinutes: 99, kind: "hiit" }]);

  expect(days.every((day) => day.hiit === 0 && day.walk === 0 && day.other === 0)).toBe(true);
});
