import { filter, groupBy, isNonNullish, map, pipe } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { addDaysJst, assertHistoryRange } from "../../lib/dateRange";
import { mergeByDate } from "../health/mergeByDate";
import { pearson } from "./pearson";

type CorrelationsArgs = Record<"fromDateJst" | "toDateJst", Doc<"healthMetrics">["dateJst"]>;
type BodyBattery = NonNullable<Doc<"healthMetrics">["bodyBattery"]>;
type DateJst = Doc<"healthMetrics">["dateJst"];
type HealthMetricValue = NonNullable<
  Doc<"healthMetrics">["bodyBattery"] | Doc<"healthMetrics">["sleepScore"]
>;
type StudyMinutes = Doc<"studyBlocks">["plannedMinutes"];

type Day = {
  bodyBattery?: Doc<"healthMetrics">["bodyBattery"];
  dateJst: DateJst;
  hiitPrevDay: boolean;
  sleepScore?: Doc<"healthMetrics">["sleepScore"];
  studyMinutes: StudyMinutes;
};

const MINUTE_MS = 60_000;

// §4 join spec (docs/plans/2026-07-08_06-insights.md): health (mergeByDate,
// legacy demo rows ignored) × self study minutes (same "completed accumulatedMs"
// aggregation rule as services/dashboard/study.ts) × HIIT-previous-day flag
// (workouts fetched one extra day early so the range's first day can still
// see the prior day's HIIT), joined per dateJst over [fromDateJst, toDateJst].
export async function correlations(ctx: QueryCtx, user: Doc<"appUsers">, args: CorrelationsArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const prevDayDateJst = addDaysJst(args.fromDateJst, -1);

  const [healthRows, sessions, workoutRows] = await Promise.all([
    ctx.db
      .query("healthMetrics")
      .withIndex("by_date", (q) =>
        q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
      )
      .collect(),
    ctx.db
      .query("studySessions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
      )
      .collect(),
    ctx.db
      .query("workouts")
      .withIndex("by_date", (q) => q.gte("dateJst", prevDayDateJst).lte("dateJst", args.toDateJst))
      .collect(),
  ]);

  const healthByDate = new Map(mergeByDate(healthRows).map((row) => [row.dateJst, row]));
  const studyMinutesByDate = aggregateStudyMinutesByDate(sessions);
  const hiitDates = new Set<Doc<"workouts">["dateJst"]>();

  for (const workout of workoutRows) {
    if (workout.kind === "hiit") {
      hiitDates.add(workout.dateJst);
    }
  }

  const days = enumerateDates(args.fromDateJst, args.toDateJst).map((dateJst): Day => {
    const health = healthByDate.get(dateJst);

    return {
      bodyBattery: health?.bodyBattery,
      dateJst,
      hiitPrevDay: hiitDates.has(addDaysJst(dateJst, -1)),
      sleepScore: health?.sleepScore,
      studyMinutes: studyMinutesByDate.get(dateJst) ?? 0,
    };
  });

  const workoutsInRange = workoutRows.filter(
    (workout) => workout.dateJst >= args.fromDateJst && workout.dateJst <= args.toDateJst,
  );

  return {
    bbVsStudy: correlateWithStudyMinutes(days, (day) => day.bodyBattery),
    days,
    hiitNextDayBb: compareBodyBatteryByHiitPrevDay(days),
    sleepVsStudy: correlateWithStudyMinutes(days, (day) => day.sleepScore),
    workoutKindBreakdown: countByKind(workoutsInRange),
  };
}

function correlateWithStudyMinutes(
  days: Day[],
  selectMetric: (day: Day) => HealthMetricValue | undefined,
) {
  const pairs = pipe(
    days,
    map((day) => {
      const metric = selectMetric(day);

      return metric === undefined ? null : ([metric, day.studyMinutes] as const);
    }),
    filter(isNonNullish),
  );

  return { n: pairs.length, r: pearson(pairs) };
}

function compareBodyBatteryByHiitPrevDay(days: Day[]) {
  const withHiit: BodyBattery[] = [];
  const withoutHiit: BodyBattery[] = [];

  for (const day of days) {
    if (day.bodyBattery === undefined) {
      continue;
    }

    (day.hiitPrevDay ? withHiit : withoutHiit).push(day.bodyBattery);
  }

  return {
    withHiit: { avg: average(withHiit), n: withHiit.length },
    withoutHiit: { avg: average(withoutHiit), n: withoutHiit.length },
  };
}

function average(values: BodyBattery[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Same aggregation rule as services/dashboard/study.ts'
// resolveTodayActualMinutes: only "completed" sessions count, summed by
// accumulatedMs (ms), converted to minutes via Math.round — applied per
// dateJst across the whole range instead of a single day.
function aggregateStudyMinutesByDate(sessions: Doc<"studySessions">[]) {
  const completedMsByDate = new Map<
    Doc<"studySessions">["dateJst"],
    Doc<"studySessions">["accumulatedMs"]
  >();

  for (const session of sessions) {
    if (session.status !== "completed") {
      continue;
    }

    completedMsByDate.set(
      session.dateJst,
      (completedMsByDate.get(session.dateJst) ?? 0) + session.accumulatedMs,
    );
  }

  return new Map(
    [...completedMsByDate.entries()].map(([dateJst, ms]) => [dateJst, Math.round(ms / MINUTE_MS)]),
  );
}

function countByKind(workouts: Doc<"workouts">[]) {
  const grouped = groupBy(workouts, (workout) => workout.kind);

  return Object.entries(grouped).map(([kind, rows]) => ({
    count: rows.length,
    kind: kind as Doc<"workouts">["kind"],
  }));
}

function enumerateDates(fromDateJst: DateJst, toDateJst: DateJst) {
  const dates: DateJst[] = [];
  let current = fromDateJst;

  while (current <= toDateJst) {
    dates.push(current);
    current = addDaysJst(current, 1);
  }

  return dates;
}
