import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

// CVX-05: cron targets must be internal.* only, never api.* — this file must
// never import `api` from _generated/api.
//
// JST (Asia/Tokyo) is UTC+9 with no DST, so JST 06:30 is always exactly
// UTC 21:30 of the PREVIOUS calendar day (06:30 - 9:00 wraps back a day).
// Convex's `daily` schedule only accepts a UTC wall-clock time, so
// hourUTC: 21 / minuteUTC: 30 is what lands at 06:30 JST every day (NFR-3,
// plan §2 Step 6).
const crons = cronJobs();

crons.daily(
  "garmin daily sync",
  { hourUTC: 21, minuteUTC: 30 },
  internal.actions.garmin.syncDaily.syncDaily,
);

export default crons;
