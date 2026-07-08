import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useLastSync() {
  return useSuspenseQuery(convexQuery(api.queries.health.lastSync.lastSync, {}));
}
