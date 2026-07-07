import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function healthRangeQuery(fromDateJst: string, toDateJst: string) {
  return convexQuery(api.queries.health.range.range, { fromDateJst, toDateJst });
}
