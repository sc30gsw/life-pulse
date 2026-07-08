import type { FunctionReturnType } from "convex/server";

import type { api } from "~/../convex/_generated/api";

// Client-side type derived from the Convex function's return shape (CVX-16 /
// convex-tanstack.md "Client-side types") — never hand-duplicated.
export type InsightsCorrelations = FunctionReturnType<
  typeof api.queries.insights.correlations.correlations
>;

export type InsightsDay = InsightsCorrelations["days"][number];
export type InsightsCorrelation = InsightsCorrelations["bbVsStudy"];
