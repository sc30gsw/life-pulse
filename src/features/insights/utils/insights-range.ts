import { INSIGHTS_RANGE_DAYS } from "~/features/insights/constants";
import { pastDateJstRange, todayJst } from "~/utils/date-jst";

// /insights shows the trailing 28 days INCLUDING today (same shape as
// health/utils/metrics-range.ts). Reuses pastDateJstRange's date math (NFR-3)
// and shifts the end back onto today.
export function insightsRangeJst() {
  const toDateJst = todayJst();
  const { fromDateJst } = pastDateJstRange(toDateJst, INSIGHTS_RANGE_DAYS - 1);

  return { fromDateJst, toDateJst };
}
