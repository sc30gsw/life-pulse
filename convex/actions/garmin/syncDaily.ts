"use node";

// internalAction (CVX-01/06): "use node" is required here because this file
// calls createGarminClient() from convex/actions/garmin/client.ts, which loads
// the garmin-connect-sdk bundle (Node-only, see that file's header comment).
//
// Flow (plan §2 Step 6 / §0-3): the nightly cron syncs the PREVIOUS day + TODAY
// (dateJst values derived from Date.now() via convex/lib/dateRange.ts — actions
// may call Date.now() freely; CVX-14 only restricts query handlers); the manual
// `backfill` action widens the same flow to the last N days (default 28). Both
// share syncRange: steps come from ONE patched range request (see client.ts's
// NOTE), the other four endpoints are fetched per day SEQUENTIALLY — Garmin
// rate-limits aggressively (observed 429s), so days are never fanned out in
// parallel. Each day's raw payload goes through the pure mapDailyMetrics
// (Step 4), then ALL days are written with exactly ONE ctx.runMutation call
// (CVX-07 — never per-day in a loop, all within upsertFromSync's single
// transaction, CVX-15). Any thrown error (missing/expired tokens, Garmin API
// failure, etc.) is caught, recorded via recordSyncFailure, and swallowed so a
// failed sync never crashes or blocks tomorrow's cron run (CVX-17: every
// scheduler / runMutation call below is awaited).
import { v } from "convex/values";
import { filter, isNonNullish, map, pipe } from "remeda";

import { internal } from "../../_generated/api";
import { type ActionCtx, internalAction } from "../../_generated/server";
import { addDaysJst, type DateJst, MAX_HISTORY_RANGE_DAYS, todayJst } from "../../lib/dateRange";
import { mapDailyMetrics, type RawGarminDailyMetrics } from "../../services/garmin/mapDailyMetrics";
import { createGarminClient } from "./client";

// Pause between per-day fetches so a 28-day backfill (28 × 4 requests) stays
// under Garmin's rate limit instead of tripping the 429s seen when the whole
// range was requested at once. 28 days ≈ 42s total — well inside the action
// time budget, and irrelevant for the 2-day cron path.
const PER_DAY_DELAY_MS = 500;

async function syncRange(ctx: ActionCtx, fromJst: DateJst, toJst: DateJst) {
  try {
    const client = createGarminClient();

    // One request returns a per-day entry for the whole range (patched
    // endpoint, client.ts NOTE) — keyed by calendarDate for the loop below.
    const stepsByDate = new Map(
      pipe(
        await client.fetchDailySteps(fromJst, toJst),
        map((entry) =>
          typeof entry.calendarDate === "string" ? ([entry.calendarDate, entry] as const) : null,
        ),
        filter(isNonNullish),
      ),
    );

    const days = [];
    const failedDates: DateJst[] = [];
    let firstDayError: unknown;
    let first = true;

    for (let dateJst = fromJst; dateJst <= toJst; dateJst = addDaysJst(dateJst, 1)) {
      if (!first) {
        await new Promise((resolve) => setTimeout(resolve, PER_DAY_DELAY_MS));
      }

      first = false;

      // One bad day must not abort the whole range: Garmin's per-day payloads
      // for older dates can fail the SDK's zod validation
      // (GarminValidationError — observed aborting a 28-day backfill after
      // writing nothing). Skip that day, keep the rest, and report the skipped
      // dates through recordSyncFailure below.
      let raw: Awaited<ReturnType<typeof client.fetchDailyMetrics>>;

      try {
        raw = await client.fetchDailyMetrics(dateJst);
      } catch (error) {
        failedDates.push(dateJst);
        firstDayError ??= error;
        continue;
      }

      // The SDK's zod `.passthrough()` schemas type unlisted fields (e.g.
      // `restingHeartRate`, `sleepScores`, `hrvSummary`'s contents) as an
      // unknown-keyed catchall, which doesn't structurally satisfy
      // mapDailyMetrics's intentionally SDK-independent RawGarminDailyMetrics
      // mirror (see that file's header comment) even though the runtime shape
      // matches. Bridge the two at this one SDK boundary.
      days.push(
        mapDailyMetrics(
          { ...raw, dailySteps: stepsByDate.get(dateJst) } as RawGarminDailyMetrics,
          dateJst,
        ),
      );
    }

    if (days.length > 0) {
      await ctx.runMutation(internal.mutations.health.upsertFromSync.upsertFromSync, { days });
    }

    if (failedDates.length > 0) {
      await ctx.runMutation(internal.mutations.health.recordSyncFailure.recordSyncFailure, {
        message: `${failedDates.length} day(s) skipped [${failedDates.join(", ")}]: ${String(firstDayError)}`,
      });
    }
  } catch (error) {
    await ctx.runMutation(internal.mutations.health.recordSyncFailure.recordSyncFailure, {
      message: String(error),
    });
  }

  return null;
}

export const syncDaily = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const today = todayJst();

    return syncRange(ctx, addDaysJst(today, -1), today);
  },
});

// Manual one-shot: `npx convex run actions/garmin/syncDaily:backfill` pulls the
// last `days` days (default 28) after first login or a long sync outage.
// Clamped to MAX_HISTORY_RANGE_DAYS so one backfill can never exceed what the
// history queries are allowed to read back (convex/lib/dateRange.ts).
export const backfill = internalAction({
  args: { days: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const days = Math.min(Math.max(Math.trunc(args.days ?? 28), 1), MAX_HISTORY_RANGE_DAYS);
    const today = todayJst();

    return syncRange(ctx, addDaysJst(today, -(days - 1)), today);
  },
});
