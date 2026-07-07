import { groupBy, map, sortBy, unique } from "remeda";

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type HistoryArgs = Record<"fromDateJst" | "toDateJst", Doc<"dogEvents">["dateJst"]>;
type HistoryOptions = HistoryArgs & Partial<Record<"includeOlderDays", boolean>>;

type HistoryEvent = Pick<Doc<"dogEvents">, "_id" | "at" | "dateJst" | "kind"> &
  Record<"byDisplayName", Doc<"appUsers">["displayName"]>;

const INITIAL_HISTORY_DAY_COUNT = 2;

export async function history(ctx: QueryCtx, args: HistoryOptions) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const rawEvents = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst))
    .collect();

  const actorsById = await resolveActorsById(ctx, unique(rawEvents.map((event) => event.byUserId)));

  const eventsWithActor = rawEvents
    .map((event): HistoryEvent | null => {
      const byDisplayName = actorsById.get(event.byUserId);

      // A missing appUsers row means the actor was deleted after logging the
      // event; drop it rather than surfacing a broken reference in the history.
      if (byDisplayName === undefined) {
        return null;
      }

      return {
        _id: event._id,
        at: event.at,
        byDisplayName,
        dateJst: event.dateJst,
        kind: event.kind,
      };
    })
    .filter((event) => event !== null);

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
    users.filter((user) => user !== null).map((user) => [user._id, user.displayName] as const),
  );
}

function groupByDateDesc(events: HistoryEvent[]) {
  const grouped = groupBy(events, (event) => event.dateJst);
  const sortedDays = sortBy(Object.entries(grouped), [([dateJst]) => dateJst, "desc"]);

  return map(sortedDays, ([dateJst, dayEvents]) => ({
    dateJst,
    events: map(
      sortBy(dayEvents, (event) => event.at),
      ({ _id, at, byDisplayName, kind }) => ({ at, byDisplayName, id: _id, kind }),
    ),
  }));
}
