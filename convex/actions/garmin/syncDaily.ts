"use node";

// internalAction (CVX-01/06): "use node" is required here because this file
// calls createGarminClient() from convex/actions/garmin/client.ts, which loads
// the garmin-connect-sdk bundle (Node-only, see that file's header comment).
//
// Flow (plan §2 Step 6 / §0-3): fetch the PREVIOUS day + TODAY (exactly two
// dateJst values, derived from Date.now() via convex/lib/dateRange.ts —
// actions may call Date.now() freely; CVX-14 only restricts query handlers),
// map each day's raw payload through the pure mapDailyMetrics (Step 4), then
// write both days with exactly ONE ctx.runMutation call (CVX-07 — never
// per-day in a loop, all within upsertFromSync's single transaction, CVX-15).
// Any thrown error (missing/expired tokens, Garmin API failure, etc.) is
// caught, recorded via recordSyncFailure, and swallowed so a failed sync
// never crashes or blocks tomorrow's cron run (CVX-17: every scheduler /
// runMutation call below is awaited).
import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import { mapDailyMetrics, type RawGarminDailyMetrics } from "../../services/garmin/mapDailyMetrics";
import { createGarminClient } from "./client";

export const syncDaily = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    try {
      const today = todayJst();
      const yesterday = addDaysJst(today, -1);

      const client = createGarminClient();
      const [yesterdayRaw, todayRaw] = await Promise.all([
        client.fetchDailyMetrics(yesterday),
        client.fetchDailyMetrics(today),
      ]);

      // The SDK's zod `.passthrough()` schemas type unlisted fields (e.g.
      // `restingHeartRate`, `sleepScores`, `hrvSummary`'s contents) as an
      // unknown-keyed catchall, which doesn't structurally satisfy
      // mapDailyMetrics's intentionally SDK-independent RawGarminDailyMetrics
      // mirror (see that file's header comment) even though the runtime shape
      // matches. Bridge the two at this one SDK boundary.
      const days = [
        mapDailyMetrics(yesterdayRaw as RawGarminDailyMetrics, yesterday),
        mapDailyMetrics(todayRaw as RawGarminDailyMetrics, today),
      ];

      await ctx.runMutation(internal.mutations.health.upsertFromSync.upsertFromSync, { days });
    } catch (error) {
      await ctx.runMutation(internal.mutations.health.recordSyncFailure.recordSyncFailure, {
        message: String(error),
      });
    }

    return null;
  },
});
