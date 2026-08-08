import { useSuspenseQuery } from "@tanstack/react-query";

import { healthAnalyticsQuery } from "~/features/health/api/health-analytics-query";
import {
  analyticsRangeJst,
  type AnalyticsPeriodDays,
} from "~/features/insights/utils/analytics-range";

export function useHealthRange(days: AnalyticsPeriodDays = 28) {
  const { fromDateJst, toDateJst } = analyticsRangeJst(days);

  return useSuspenseQuery(healthAnalyticsQuery(fromDateJst, toDateJst));
}
