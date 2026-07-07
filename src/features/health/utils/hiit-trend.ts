import type { Doc } from "~/../convex/_generated/dataModel";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";
import { dayjs } from "~/utils/dayjs";

export const HIIT_TREND_DAYS = 14;

export function hiitTrendRangeJst() {
  const toDateJst = todayJst();
  const { fromDateJst } = pastDateJstRange(toDateJst, HIIT_TREND_DAYS - 1);

  return { fromDateJst, toDateJst };
}

export function bucketDailyDuration(
  workouts: ReadonlyArray<Pick<Doc<"workouts">, "dateJst" | "durationMinutes">>,
) {
  const { fromDateJst, toDateJst } = hiitTrendRangeJst();

  const totalsByDate = new Map<Doc<"workouts">["dateJst"], Doc<"workouts">["durationMinutes"]>();

  for (const workout of workouts) {
    totalsByDate.set(
      workout.dateJst,
      (totalsByDate.get(workout.dateJst) ?? 0) + workout.durationMinutes,
    );
  }

  const days: Array<{
    date: Doc<"workouts">["dateJst"];
    durationMinutes: Doc<"workouts">["durationMinutes"];
  }> = [];
  const end = dayjs.tz(toDateJst, "Asia/Tokyo");
  let cursor = dayjs.tz(fromDateJst, "Asia/Tokyo");
  while (!cursor.isAfter(end)) {
    days.push({
      date: cursor.format("M/D"),
      durationMinutes: totalsByDate.get(cursor.format("YYYY-MM-DD")) ?? 0,
    });
    cursor = cursor.add(1, "day");
  }

  return days;
}
