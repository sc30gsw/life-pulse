import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useViewer() {
  return useSuspenseQuery(convexQuery(api.queries.users.viewer.viewer, {}));
}
