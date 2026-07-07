import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dashboardSelfPresenceQuery() {
  return convexQuery(api.queries.dashboard.selfPresence.selfPresence, {});
}
