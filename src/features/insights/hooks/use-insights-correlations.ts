import { useSuspenseQuery } from "@tanstack/react-query";

import { insightsCorrelationsQuery } from "~/features/insights/api/insights-correlations-query";
import { insightsRangeJst } from "~/features/insights/utils/insights-range";

export function useInsightsCorrelations() {
  const { fromDateJst, toDateJst } = insightsRangeJst();

  return useSuspenseQuery(insightsCorrelationsQuery(fromDateJst, toDateJst));
}
