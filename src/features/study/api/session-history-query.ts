import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HistoryQueryArgs = FunctionArgs<typeof api.queries.sessions.history.history>;

export function sessionHistoryQuery(
  fromDateJst: HistoryQueryArgs["fromDateJst"],
  toDateJst: HistoryQueryArgs["toDateJst"],
) {
  return convexQuery(api.queries.sessions.history.history, { fromDateJst, toDateJst });
}
