import { ConvexError } from "convex/values";

import type { Doc } from "../_generated/dataModel";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const MAX_HISTORY_RANGE_DAYS = 31;

type DateJst = Doc<"dogEvents">["dateJst"];

// Guards a history query's dateJst range: rejects inverted ranges and ranges
// wide enough to defeat the index-bounded read (CVX-11).
// NOTE: types here derive from the data model, never from _generated/api —
// importing `api` inside convex/ is a CVX-05 review violation and would
// create a lib ← queries import cycle.
export function assertHistoryRange(fromDateJst: DateJst, toDateJst: DateJst) {
  if (fromDateJst > toDateJst || rangeDays(fromDateJst, toDateJst) > MAX_HISTORY_RANGE_DAYS) {
    throw new ConvexError("RANGE_TOO_WIDE");
  }
}

function rangeDays(fromDateJst: DateJst, toDateJst: DateJst) {
  const fromMs = Date.parse(`${fromDateJst}T00:00:00Z`);
  const toMs = Date.parse(`${toDateJst}T00:00:00Z`);
  return Math.round((toMs - fromMs) / ONE_DAY_MS);
}
