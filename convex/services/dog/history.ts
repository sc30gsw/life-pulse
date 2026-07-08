import { filter, groupBy, isNonNullish, map, pipe, sortBy, unique } from "remeda";

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type HistoryArgs = Record<"fromDateJst" | "toDateJst", Doc<"dogEvents">["dateJst"]>;
type HistoryOptions = HistoryArgs & Partial<Record<"includeOlderDays", boolean>>;

type HistoryEvent = Pick<Doc<"dogEvents">, "_id" | "at" | "dateJst"> &
  Record<"byDisplayName", Doc<"appUsers">["displayName"]> &
  Record<"taskName", Doc<"dogTasks">["name"]>;

const INITIAL_HISTORY_DAY_COUNT = 2;

export async function history(ctx: QueryCtx, args: HistoryOptions) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const rawEvents = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst))
    .collect();

  const [actorsById, taskNamesById] = await Promise.all([
    resolveActorsById(ctx, unique(rawEvents.map((event) => event.byUserId))),
    resolveTaskNamesById(ctx, unique(rawEvents.map((event) => event.taskId))),
  ]);

  const eventsWithActor = pipe(
    rawEvents,
    map((event): HistoryEvent | null => {
      const byDisplayName = actorsById.get(event.byUserId);
      const taskName = taskNamesById.get(event.taskId);

      // A missing appUsers row means the actor was deleted after logging the
      // event; a missing dogTasks row should never happen since tasks are
      // only soft-deleted. Either way, drop it rather than surfacing a
      // broken reference in the history.
      if (byDisplayName === undefined || taskName === undefined) {
        return null;
      }

      return {
        _id: event._id,
        at: event.at,
        byDisplayName,
        dateJst: event.dateJst,
        taskName,
      };
    }),
    filter(isNonNullish),
  );

  const allDays = groupByDateDesc(eventsWithActor);
  const olderDayCount = Math.max(allDays.length - INITIAL_HISTORY_DAY_COUNT, 0);
  const days = args.includeOlderDays ? allDays : allDays.slice(0, INITIAL_HISTORY_DAY_COUNT);

  return {
    days,
    summary: {
      eventCount: eventsWithActor.length,
      hasOlderDays: olderDayCount > 0,
      olderDayCount,
      totalDayCount: allDays.length,
    },
  };
}

async function resolveActorsById(ctx: QueryCtx, userIds: Id<"appUsers">[]) {
  const users = await Promise.all(userIds.map((userId) => ctx.db.get("appUsers", userId)));

  return new Map(
    pipe(
      users,
      map((user) => (user === null ? null : ([user._id, user.displayName] as const))),
      filter(isNonNullish),
    ),
  );
}

async function resolveTaskNamesById(ctx: QueryCtx, taskIds: Id<"dogTasks">[]) {
  const tasks = await Promise.all(taskIds.map((taskId) => ctx.db.get("dogTasks", taskId)));

  return new Map(
    pipe(
      tasks,
      map((task) => (task === null ? null : ([task._id, task.name] as const))),
      filter(isNonNullish),
    ),
  );
}

function groupByDateDesc(events: HistoryEvent[]) {
  const grouped = groupBy(events, (event) => event.dateJst);
  const sortedDays = sortBy(Object.entries(grouped), [([dateJst]) => dateJst, "desc"]);

  return map(sortedDays, ([dateJst, dayEvents]) => ({
    dateJst,
    events: map(
      sortBy(dayEvents, (event) => event.at),
      ({ _id, at, byDisplayName, taskName }) => ({ at, byDisplayName, id: _id, taskName }),
    ),
  }));
}
