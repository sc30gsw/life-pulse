import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type LiveQueryArgs = FunctionArgs<typeof api.queries.dashboard.live.live>;

export function dashboardLiveQuery(dateJst: LiveQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.live.live, { dateJst });
}
