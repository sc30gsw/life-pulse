import { groupBy, map, sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type HistoryArgs = Record<"fromDateJst" | "toDateJst", Doc<"studySessions">["dateJst"]>;

const MINUTE_MS = 60_000;

export async function history(ctx: QueryCtx, user: Doc<"appUsers">, args: HistoryArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const sessions = await ctx.db
    .query("studySessions")
    .withIndex("by_user_date", (q) =>
      q.eq("userId", user._id).gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
    )
    .collect();

  return { days: groupByDateDesc(sessions) };
}

function groupByDateDesc(sessions: Doc<"studySessions">[]) {
  const grouped = groupBy(sessions, (session) => session.dateJst);
  const sortedDays = sortBy(Object.entries(grouped), [([dateJst]) => dateJst, "desc"]);

  return map(sortedDays, ([dateJst, daySessions]) => ({
    dateJst,
    sessions: map(
      sortBy(daySessions, (session) => session.startedAt),
      (session) => ({
        actualMinutes: Math.round(session.accumulatedMs / MINUTE_MS),
        category: session.category,
        id: session._id,
        interruptionCount: session.interruptionCount,
        startedAt: session.startedAt,
        status: session.status,
      }),
    ),
  }));
}
