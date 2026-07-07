import { groupBy, map, sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { assertHistoryRange } from "../../lib/dateRange";

type HistoryArgs = Record<"fromDateJst" | "toDateJst", Doc<"studySessions">["dateJst"]>;

type SessionWithReasons = Doc<"studySessions"> &
  Record<"reasons", Doc<"interruptions">["reason"][]>;

const MINUTE_MS = 60_000;

export async function history(ctx: QueryCtx, user: Doc<"appUsers">, args: HistoryArgs) {
  assertHistoryRange(args.fromDateJst, args.toDateJst);

  const sessions = await ctx.db
    .query("studySessions")
    .withIndex("by_user_date", (q) =>
      q.eq("userId", user._id).gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
    )
    .collect();

  // FR-2.8 / spec §6「セッション詳細(中断内訳)」: join each session's
  // interruptions via by_session. The range is capped at 31 days of the
  // caller's own sessions, so this per-session indexed read stays small.
  const sessionsWithReasons = await Promise.all(
    sessions.map(async (session): Promise<SessionWithReasons> => {
      const interruptions = await ctx.db
        .query("interruptions")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();

      return {
        ...session,
        reasons: sortBy(interruptions, (interruption) => interruption.pausedAt).map(
          (interruption) => interruption.reason,
        ),
      };
    }),
  );

  return { days: groupByDateDesc(sessionsWithReasons) };
}

function groupByDateDesc(sessions: SessionWithReasons[]) {
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
        reasons: session.reasons,
        startedAt: session.startedAt,
        status: session.status,
      }),
    ),
  }));
}
