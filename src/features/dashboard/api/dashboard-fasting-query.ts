import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dashboardFastingQuery() {
  return convexQuery(api.queries.dashboard.fasting.fasting, {});
}
