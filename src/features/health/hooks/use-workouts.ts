import { useSuspenseQuery } from "@tanstack/react-query";

import { healthWorkoutsQuery } from "~/features/health/api/health-workouts-query";
import { metricsRangeJst } from "~/features/health/utils/metrics-range";

export function useWorkouts() {
  const { fromDateJst, toDateJst } = metricsRangeJst();

  return useSuspenseQuery(healthWorkoutsQuery(fromDateJst, toDateJst));
}
