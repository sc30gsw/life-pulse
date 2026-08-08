import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type StudyAnalyticsArgs = FunctionArgs<typeof api.queries.insights.studyAnalytics.studyAnalytics>;

export function studyAnalyticsQuery(
  fromDateJst: StudyAnalyticsArgs["fromDateJst"],
  toDateJst: StudyAnalyticsArgs["toDateJst"],
) {
  return convexQuery(api.queries.insights.studyAnalytics.studyAnalytics, {
    fromDateJst,
    toDateJst,
  });
}
