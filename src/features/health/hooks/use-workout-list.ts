import { useSuspenseQuery } from "@tanstack/react-query";

import { healthWorkoutListQuery } from "~/features/health/api/health-workout-list-query";
import { metricsRangeJst } from "~/features/health/utils/metrics-range";

export function useWorkoutList() {
  const { fromDateJst, toDateJst } = metricsRangeJst();

  return useSuspenseQuery(healthWorkoutListQuery(fromDateJst, toDateJst));
}
