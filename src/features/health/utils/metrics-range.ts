import { pastDateJstRange, todayJst } from "~/utils/date-jst";

// /health shows the trailing 28 days of metrics INCLUDING today (unlike
// pastDateJstRange's own default of "N days ending yesterday", used by
// history-style views). Reuses pastDateJstRange's date math (NFR-3) and just
// shifts the end back onto today.
export const METRICS_RANGE_DAYS = 28;

export function metricsRangeJst() {
  const toDateJst = todayJst();
  const { fromDateJst } = pastDateJstRange(toDateJst, METRICS_RANGE_DAYS - 1);

  return { fromDateJst, toDateJst };
}
