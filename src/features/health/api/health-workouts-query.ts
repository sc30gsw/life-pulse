import { convexQuery } from "@convex-dev/react-query";

import { api } from "~/../convex/_generated/api";

export function healthWorkoutsQuery(fromDateJst: string, toDateJst: string) {
  return convexQuery(api.queries.health.workouts.workouts, { fromDateJst, toDateJst });
}
