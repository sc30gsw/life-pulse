import { Result, TaggedError, type Result as ResultType } from "better-result";
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc";

import type { Doc } from "../_generated/dataModel";
import { DATE_JST_PATTERN } from "./domain";
import { unwrapConvexResult } from "./result";

export const MAX_HISTORY_RANGE_DAYS = 31;
export const MAX_ANALYTICS_RANGE_DAYS = 90;

export type DateJst = Doc<"healthMetrics">["dateJst"];

dayjsBase.extend(utc);

class DateRangeError extends TaggedError("DateRangeError")<{
  code: "INVALID_DATE" | "RANGE_TOO_WIDE";
  message: string;
}>() {
  constructor(code: "INVALID_DATE" | "RANGE_TOO_WIDE") {
    super({ code, message: code });
  }
}

// A malformed dateJst must never reach an index range condition: lexicographic
// bounds like gte("0")/lte("a") span every real "YYYY-MM-DD" value, turning the
// index-bounded read into a full scan (CVX-11).
export function validateDateJst(dateJst: DateJst): ResultType<void, DateRangeError> {
  if (!DATE_JST_PATTERN.test(dateJst) || !dayjsBase.utc(dateJst, "YYYY-MM-DD", true).isValid()) {
    return Result.err(new DateRangeError("INVALID_DATE"));
  }

  return Result.ok();
}

export function assertDateJst(dateJst: DateJst) {
  return unwrapConvexResult(validateDateJst(dateJst));
}

export function todayJst(): DateJst {
  return dayjsBase().utcOffset(9).format("YYYY-MM-DD");
}

export function addDaysJst(dateJst: DateJst, days: number): DateJst {
  assertDateJst(dateJst);

  return dayjsBase.utc(dateJst, "YYYY-MM-DD", true).add(days, "day").format("YYYY-MM-DD");
}

// Guards a history query's dateJst range: rejects malformed dates, inverted
// ranges, and ranges wide enough to defeat the index-bounded read (CVX-11).
// NOTE: types here derive from the data model, never from _generated/api —
// importing `api` inside convex/ is a CVX-05 review violation and would
// create a lib ← queries import cycle.
export function validateHistoryRange(
  fromDateJst: DateJst,
  toDateJst: DateJst,
): ResultType<void, DateRangeError> {
  const fromResult = validateDateJst(fromDateJst);
  if (Result.isError(fromResult)) {
    return fromResult;
  }

  const toResult = validateDateJst(toDateJst);
  if (Result.isError(toResult)) {
    return toResult;
  }

  if (fromDateJst > toDateJst || rangeDays(fromDateJst, toDateJst) > MAX_HISTORY_RANGE_DAYS) {
    return Result.err(new DateRangeError("RANGE_TOO_WIDE"));
  }

  return Result.ok();
}

export function assertHistoryRange(fromDateJst: DateJst, toDateJst: DateJst) {
  return unwrapConvexResult(validateHistoryRange(fromDateJst, toDateJst));
}

/** Analysis queries may opt into a bounded 90-day window without weakening the
 * 31-day guard used by ordinary history endpoints. */
export function validateAnalyticsRange(
  fromDateJst: DateJst,
  toDateJst: DateJst,
): ResultType<void, DateRangeError> {
  const fromResult = validateDateJst(fromDateJst);
  if (Result.isError(fromResult)) {
    return fromResult;
  }

  const toResult = validateDateJst(toDateJst);
  if (Result.isError(toResult)) {
    return toResult;
  }

  if (fromDateJst > toDateJst || rangeDays(fromDateJst, toDateJst) > MAX_ANALYTICS_RANGE_DAYS) {
    return Result.err(new DateRangeError("RANGE_TOO_WIDE"));
  }

  return Result.ok();
}

export function assertAnalyticsRange(fromDateJst: DateJst, toDateJst: DateJst) {
  return unwrapConvexResult(validateAnalyticsRange(fromDateJst, toDateJst));
}

function rangeDays(fromDateJst: DateJst, toDateJst: DateJst) {
  return dayjsBase
    .utc(toDateJst, "YYYY-MM-DD", true)
    .diff(dayjsBase.utc(fromDateJst, "YYYY-MM-DD", true), "day");
}
