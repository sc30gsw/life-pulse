import { useSuspenseQuery } from "@tanstack/react-query";

import { fastingAnalyticsQuery } from "~/features/fasting/api/fasting-analytics-query";
import {
  analyticsRangeJst,
  type AnalyticsPeriodDays,
} from "~/features/insights/utils/analytics-range";

export function useFastingAnalytics(days: AnalyticsPeriodDays = 28) {
  const { fromDateJst, toDateJst } = analyticsRangeJst(days);

  return useSuspenseQuery(fastingAnalyticsQuery(fromDateJst, toDateJst));
}
