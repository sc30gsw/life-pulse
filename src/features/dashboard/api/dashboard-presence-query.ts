import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dashboardPresenceQuery() {
  return convexQuery(api.queries.dashboard.presence.presence, {});
}
