import { expect, test } from "vite-plus/test";

import { METRICS_RANGE_DAYS, metricsRangeJst } from "~/features/health/utils/metrics-range";
import { todayJst } from "~/utils/date-jst";

test("returns a 28-day range ending today", () => {
  const { fromDateJst, toDateJst } = metricsRangeJst();

  expect(toDateJst).toBe(todayJst());
  expect(fromDateJst < toDateJst).toBe(true);
});

test("spans exactly METRICS_RANGE_DAYS calendar days", () => {
  const { fromDateJst, toDateJst } = metricsRangeJst();
  const spanDays = (Date.parse(toDateJst) - Date.parse(fromDateJst)) / 86_400_000 + 1;

  expect(spanDays).toBe(METRICS_RANGE_DAYS);
});
