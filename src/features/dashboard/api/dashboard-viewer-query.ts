import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dashboardViewerQuery() {
  return convexQuery(api.queries.dashboard.viewer.viewer, {});
}
