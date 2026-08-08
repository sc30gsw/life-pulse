import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type FastingAnalyticsArgs = FunctionArgs<typeof api.queries.fasting.analytics.analytics>;

export function fastingAnalyticsQuery(
  fromDateJst: FastingAnalyticsArgs["fromDateJst"],
  toDateJst: FastingAnalyticsArgs["toDateJst"],
) {
  return convexQuery(api.queries.fasting.analytics.analytics, { fromDateJst, toDateJst });
}
