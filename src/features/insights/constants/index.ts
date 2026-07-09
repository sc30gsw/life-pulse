// docs/plans/2026-07-08_06-insights.md §2 — fixed 28-day range (matches Garmin's
// MAX_HISTORY_RANGE_DAYS backfill window) and the UI-side "enough data" threshold
// for showing a correlation coefficient instead of "データ不足".
export const INSIGHTS_RANGE_DAYS = 28;
export const MIN_CORRELATION_N = 10;
