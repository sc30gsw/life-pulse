import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function dogTasksQuery() {
  return convexQuery(api.queries.dogTasks.list.list, {});
}
