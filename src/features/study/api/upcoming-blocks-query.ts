import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type UpcomingBlocksQueryArgs = FunctionArgs<typeof api.queries.blocks.upcoming.upcoming>;

export function upcomingBlocksQuery(today: UpcomingBlocksQueryArgs["todayJst"]) {
  return convexQuery(api.queries.blocks.upcoming.upcoming, { todayJst: today });
}
