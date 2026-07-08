import type { Doc } from "~/../convex/_generated/dataModel";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";
import { dayjs } from "~/utils/dayjs";

export const HIIT_TREND_DAYS = 28;

export function hiitTrendRangeJst() {
  const toDateJst = todayJst();
  const { fromDateJst } = pastDateJstRange(toDateJst, HIIT_TREND_DAYS - 1);

  return { fromDateJst, toDateJst };
}

type DurationByKind = Record<Doc<"workouts">["kind"], number>;

function emptyDurationByKind(): DurationByKind {
  return { hiit: 0, walk: 0, other: 0 };
}

export function bucketDailyDuration(
  workouts: ReadonlyArray<Pick<Doc<"workouts">, "dateJst" | "durationMinutes" | "kind">>,
) {
  const { fromDateJst, toDateJst } = hiitTrendRangeJst();

  const totalsByDate = new Map<Doc<"workouts">["dateJst"], DurationByKind>();

  for (const workout of workouts) {
    const totals = totalsByDate.get(workout.dateJst) ?? emptyDurationByKind();
    totals[workout.kind] += workout.durationMinutes;
    totalsByDate.set(workout.dateJst, totals);
  }

  const days: Array<{ date: Doc<"workouts">["dateJst"] } & DurationByKind> = [];
  const end = dayjs.tz(toDateJst, "Asia/Tokyo");
  let cursor = dayjs.tz(fromDateJst, "Asia/Tokyo");
  while (!cursor.isAfter(end)) {
    days.push({
      date: cursor.format("M/D"),
      ...(totalsByDate.get(cursor.format("YYYY-MM-DD")) ?? emptyDurationByKind()),
    });
    cursor = cursor.add(1, "day");
  }

  return days;
}
