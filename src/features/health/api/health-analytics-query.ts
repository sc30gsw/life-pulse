import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HealthAnalyticsArgs = FunctionArgs<typeof api.queries.health.analytics.analytics>;

export function healthAnalyticsQuery(
  fromDateJst: HealthAnalyticsArgs["fromDateJst"],
  toDateJst: HealthAnalyticsArgs["toDateJst"],
) {
  return convexQuery(api.queries.health.analytics.analytics, { fromDateJst, toDateJst });
}
