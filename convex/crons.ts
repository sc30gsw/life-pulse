import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

// CVX-05: cron targets must be internal.* only, never api.* — this file must
// never import `api` from _generated/api.
//
// JST (Asia/Tokyo) is UTC+9 with no DST, so JST 06:30 is always exactly
// UTC 21:30 of the PREVIOUS calendar day (06:30 - 9:00 wraps back a day).
// Convex cron strings are UTC, so this lands at 06:30 JST every day (NFR-3,
// plan §2 Step 6).
const GARMIN_DAILY_SYNC_0630_JST_CRON = "30 21 * * *";

const crons = cronJobs();

crons.cron(
  "garmin daily sync",
  GARMIN_DAILY_SYNC_0630_JST_CRON,
  internal.actions.garmin.syncDaily.syncDaily,
);

export default crons;
