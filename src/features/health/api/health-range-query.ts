import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HealthRangeQueryArgs = FunctionArgs<typeof api.queries.health.range.range>;

export function healthRangeQuery(
  fromDateJst: HealthRangeQueryArgs["fromDateJst"],
  toDateJst: HealthRangeQueryArgs["toDateJst"],
) {
  return convexQuery(api.queries.health.range.range, { fromDateJst, toDateJst });
}
