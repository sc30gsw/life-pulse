import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HistoryQueryArgs = FunctionArgs<typeof api.queries.dog.history.history>;

export function dogHistoryQuery(
  fromDateJst: HistoryQueryArgs["fromDateJst"],
  toDateJst: HistoryQueryArgs["toDateJst"],
  includeOlderDays: HistoryQueryArgs["includeOlderDays"] = false,
) {
  return convexQuery(api.queries.dog.history.history, {
    fromDateJst,
    includeOlderDays,
    toDateJst,
  });
}
