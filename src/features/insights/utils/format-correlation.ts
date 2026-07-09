import { MIN_CORRELATION_N } from "~/features/insights/constants";
import type { InsightsCorrelation } from "~/features/insights/types/insights";

// docs/plans/2026-07-08_06-insights.md §0-3: the server always returns { r, n }
// — the n < MIN_CORRELATION_N (or r === null, e.g. zero-variance) threshold
// judgment happens here, client-side.
export function isCorrelationInsufficient(
  r: InsightsCorrelation["r"],
  n: InsightsCorrelation["n"],
) {
  return r === null || n < MIN_CORRELATION_N;
}

export function formatCorrelation(r: InsightsCorrelation["r"], n: InsightsCorrelation["n"]) {
  if (r === null || n < MIN_CORRELATION_N) {
    return `データ不足(n=${n})`;
  }

  return `r=${r.toFixed(2)}(n=${n})`;
}
