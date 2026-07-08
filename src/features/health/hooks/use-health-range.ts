import { useSuspenseQuery } from "@tanstack/react-query";

import { healthRangeQuery } from "~/features/health/api/health-range-query";
import { metricsRangeJst } from "~/features/health/utils/metrics-range";

export function useHealthRange() {
  const { fromDateJst, toDateJst } = metricsRangeJst();

  return useSuspenseQuery(healthRangeQuery(fromDateJst, toDateJst));
}
