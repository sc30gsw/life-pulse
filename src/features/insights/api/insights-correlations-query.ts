import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type InsightsCorrelationsQueryArgs = FunctionArgs<
  typeof api.queries.insights.correlations.correlations
>;

export function insightsCorrelationsQuery(
  fromDateJst: InsightsCorrelationsQueryArgs["fromDateJst"],
  toDateJst: InsightsCorrelationsQueryArgs["toDateJst"],
) {
  return convexQuery(api.queries.insights.correlations.correlations, { fromDateJst, toDateJst });
}
