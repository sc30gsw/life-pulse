import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HealthQueryArgs = FunctionArgs<typeof api.queries.dashboard.health.health>;

export function dashboardHealthQuery(dateJst: HealthQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.health.health, { dateJst });
}
