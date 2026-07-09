import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type HealthWorkoutListQueryArgs = FunctionArgs<typeof api.queries.health.workoutList.workoutList>;

export function healthWorkoutListQuery(
  fromDateJst: HealthWorkoutListQueryArgs["fromDateJst"],
  toDateJst: HealthWorkoutListQueryArgs["toDateJst"],
) {
  return convexQuery(api.queries.health.workoutList.workoutList, { fromDateJst, toDateJst });
}
