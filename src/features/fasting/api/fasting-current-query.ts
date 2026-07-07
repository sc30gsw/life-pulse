import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function fastingCurrentQuery() {
  return convexQuery(api.queries.dashboard.fasting.fasting, {});
}
