import { ConvexError } from "convex/values";
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc";

import type { Doc } from "../_generated/dataModel";

const DATE_JST_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_HISTORY_RANGE_DAYS = 31;

type DateJst = Doc<"dogEvents">["dateJst"];

dayjsBase.extend(utc);

// A malformed dateJst must never reach an index range condition: lexicographic
// bounds like gte("0")/lte("a") span every real "YYYY-MM-DD" value, turning the
// index-bounded read into a full scan (CVX-11).
export function assertDateJst(dateJst: DateJst) {
  if (!DATE_JST_PATTERN.test(dateJst) || !dayjsBase.utc(dateJst, "YYYY-MM-DD", true).isValid()) {
    throw new ConvexError("INVALID_DATE");
  }
}

export function todayJst() {
  return dayjsBase().utcOffset(9).format("YYYY-MM-DD");
}

export function addDaysJst(dateJst: DateJst, days: number) {
  assertDateJst(dateJst);

  return dayjsBase.utc(dateJst, "YYYY-MM-DD", true).add(days, "day").format("YYYY-MM-DD");
}

// Guards a history query's dateJst range: rejects malformed dates, inverted
// ranges, and ranges wide enough to defeat the index-bounded read (CVX-11).
// NOTE: types here derive from the data model, never from _generated/api —
// importing `api` inside convex/ is a CVX-05 review violation and would
// create a lib ← queries import cycle.
export function assertHistoryRange(fromDateJst: DateJst, toDateJst: DateJst) {
  assertDateJst(fromDateJst);
  assertDateJst(toDateJst);

  if (fromDateJst > toDateJst || rangeDays(fromDateJst, toDateJst) > MAX_HISTORY_RANGE_DAYS) {
    throw new ConvexError("RANGE_TOO_WIDE");
  }
}

function rangeDays(fromDateJst: DateJst, toDateJst: DateJst) {
  return dayjsBase
    .utc(toDateJst, "YYYY-MM-DD", true)
    .diff(dayjsBase.utc(fromDateJst, "YYYY-MM-DD", true), "day");
}
