import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HealthWorkoutsQueryArgs = FunctionArgs<typeof api.queries.health.workouts.workouts>;

export function healthWorkoutsQuery(
  fromDateJst: HealthWorkoutsQueryArgs["fromDateJst"],
  toDateJst: HealthWorkoutsQueryArgs["toDateJst"],
) {
  return convexQuery(api.queries.health.workouts.workouts, { fromDateJst, toDateJst });
}
