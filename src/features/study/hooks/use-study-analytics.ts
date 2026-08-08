import { useSuspenseQuery } from "@tanstack/react-query";

import {
  analyticsRangeJst,
  type AnalyticsPeriodDays,
} from "~/features/insights/utils/analytics-range";
import { studyAnalyticsQuery } from "~/features/study/api/study-analytics-query";

export function useStudyAnalytics(days: AnalyticsPeriodDays = 28) {
  const { fromDateJst, toDateJst } = analyticsRangeJst(days);

  return useSuspenseQuery(studyAnalyticsQuery(fromDateJst, toDateJst));
}
